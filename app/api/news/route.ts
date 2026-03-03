export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
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
  if (!db) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const startTimeStr = searchParams.get("startTime");
  const endTimeStr = searchParams.get("endTime");

  let query: admin.firestore.Query<admin.firestore.DocumentData> = db.collection("news_events");

  try {
    if (startTimeStr && endTimeStr) {
      // If client requests a specific window, apply the bounds and remove limit
      const startMs = Number(startTimeStr);
      const endMs = Number(endTimeStr);
      const startTimestamp = admin.firestore.Timestamp.fromMillis(startMs);
      const endTimestamp = admin.firestore.Timestamp.fromMillis(endMs);

      query = query
        .where("timestamp", ">=", startTimestamp)
        .where("timestamp", "<=", endTimestamp)
        .orderBy("timestamp", "asc"); // Order ascending when fetching historical chunks
    } else {
      // Default behavior: get the newest 2000 items
      query = query.orderBy("timestamp", "desc").limit(2000);
    }

    const snapshot = await query.get();

    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      const timestamp = docData.timestamp as
        | { toMillis?: () => number }
        | undefined;
      const timestampMs =
        timestamp && typeof timestamp.toMillis === "function"
          ? timestamp.toMillis()
          : (typeof docData.timestamp === "number" ? docData.timestamp : Date.now()); // Fallback robustly
      return {
        id: doc.id,
        ...docData,
        timestamp: timestampMs,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Firestore Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news events" },
      { status: 500 }
    );
  }
}
