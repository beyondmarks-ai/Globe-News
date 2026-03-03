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

// Helper to parse GDELT DATEADDED (e.g., 20231024153000) into a Date object
function parseGdeltDate(dateadded: number): Date {
    const str = String(dateadded);
    if (str.length !== 14) return new Date();
    const year = parseInt(str.substring(0, 4));
    const month = parseInt(str.substring(4, 6)) - 1;
    const day = parseInt(str.substring(6, 8));
    const hour = parseInt(str.substring(8, 10));
    const min = parseInt(str.substring(10, 12));
    const sec = parseInt(str.substring(12, 14));
    return new Date(Date.UTC(year, month, day, hour, min, sec));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const hoursBackParam = searchParams.get("hoursBack") || "24";
    const hoursBack = parseInt(hoursBackParam, 10);

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
        const bigquery = new BigQuery({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
        });

        // Query for the past X hours
        // No limits to ensure we grab everything
        const query = `
      SELECT 
        GLOBALEVENTID,
        ActionGeo_Lat AS lat, 
        ActionGeo_Long AS lng, 
        ActionGeo_FullName AS location_name,
        GoldsteinScale AS sentiment_score,
        SOURCEURL AS news_link,
        DATEADDED
      FROM 
        \`gdelt-bq.gdeltv2.events\` 
      WHERE 
        DATEADDED >= CAST(FORMAT_TIMESTAMP('%Y%m%d%H%M%S', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${hoursBack} HOUR)) AS INT64)
        AND ActionGeo_Lat IS NOT NULL 
        AND ActionGeo_Long IS NOT NULL
    `;

        const [job] = await bigquery.createQueryJob({ query, location: "US" });
        const [rows] = await job.getQueryResults();

        let savedCount = 0;

        // Firestore allows max 500 writes per batch
        const BATCH_SIZE = 500;
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = db.batch();
            const chunk = rows.slice(i, i + BATCH_SIZE);

            chunk.forEach((row: Record<string, unknown>) => {
                const docRef = db.collection("news_events").doc(String(row.GLOBALEVENTID));
                const eventDate = parseGdeltDate(Number(row.DATEADDED));

                batch.set(
                    docRef,
                    {
                        lat: parseFloat(String(row.lat)),
                        lng: parseFloat(String(row.lng)),
                        location_name: row.location_name,
                        sentiment_score: parseFloat(String(row.sentiment_score)),
                        news_link: row.news_link,
                        timestamp: admin.firestore.Timestamp.fromDate(eventDate),
                    },
                    { merge: true }
                );
                savedCount++;
            });

            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            message: `Successfully pulled ${rows.length} records from the past ${hoursBack} hours and saved ${savedCount} to Firebase.`,
        });
    } catch (error) {
        console.error("Backfill Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process backfill data" },
            { status: 500 }
        );
    }
}
