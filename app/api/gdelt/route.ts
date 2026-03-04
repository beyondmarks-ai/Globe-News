export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import * as admin from "firebase-admin";

// Only initialize if the app hasn't been initialized AND the variables actually exist
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The regex safely handles the newline characters whether they are real newlines or escaped strings
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export async function GET(request: Request) {
  // 1. THE SECURITY CHECK
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid Cron Secret" },
      { status: 401 }
    );
  }

  if (!db) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 503 }
    );
  }

  try {
    // 2. Initialize BigQuery
    const bigquery = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });

    // 3. Fetch exact 15-minute window (cost-saving: single slot + minimal partition scan)
    // GDELT publishes every 15 mins; we query only the most recent *completed* slot
    // e.g. at 12:17 → fetch 12:00–12:15 only (not "last 15 mins" to avoid overlap & extra scan)
    const query = `
      WITH slot AS (
        SELECT 
          TIMESTAMP_SUB(
            TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), MINUTE),
            INTERVAL (MOD(EXTRACT(MINUTE FROM CURRENT_TIMESTAMP()), 15) + 15) MINUTE
          ) AS window_start
      )
      SELECT 
        e.GLOBALEVENTID,
        e.ActionGeo_Lat AS lat, 
        e.ActionGeo_Long AS lng, 
        e.ActionGeo_FullName AS location_name,
        e.GoldsteinScale AS sentiment_score,
        e.SOURCEURL AS news_link
      FROM \`gdelt-bq.gdeltv2.events\` e
      CROSS JOIN slot s
      WHERE 
        (e._PARTITIONTIME = DATE(s.window_start)
         OR e._PARTITIONTIME = DATE(TIMESTAMP_ADD(s.window_start, INTERVAL 15 MINUTE)))
        AND e.DATEADDED >= CAST(FORMAT_TIMESTAMP('%Y%m%d%H%M%S', s.window_start) AS INT64)
        AND e.DATEADDED < CAST(FORMAT_TIMESTAMP('%Y%m%d%H%M%S', TIMESTAMP_ADD(s.window_start, INTERVAL 15 MINUTE)) AS INT64)
        AND e.ActionGeo_Lat IS NOT NULL 
        AND e.ActionGeo_Long IS NOT NULL
      LIMIT 1000;
    `;

    const [job] = await bigquery.createQueryJob({ query, location: "US" });
    const [rows] = await job.getQueryResults();

    // 4. Save to Firebase Firestore using a Batch write (super fast!)
    const batch = db.batch();
    let savedCount = 0;

    rows.forEach((row: Record<string, unknown>) => {
      // Use the GLOBALEVENTID as the document ID to prevent duplicates
      const docRef = db
        .collection("news_events")
        .doc(String(row.GLOBALEVENTID));

      batch.set(
        docRef,
        {
          lat: parseFloat(row.lat as string),
          lng: parseFloat(row.lng as string),
          location_name: row.location_name,
          sentiment_score: parseFloat(row.sentiment_score as string),
          news_link: row.news_link,
          timestamp: admin.firestore.FieldValue.serverTimestamp(), // Records exactly when we saved it
        },
        { merge: true }
      );

      savedCount++;
    });

    // Execute the batch save
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully pulled ${rows.length} records and saved ${savedCount} to Firebase.`,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process data" },
      { status: 500 }
    );
  }
}
