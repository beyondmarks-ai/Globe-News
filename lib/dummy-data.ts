import type { NewsDataPoint } from "@/types/news";

/** Generate 50 dummy news points with random lat/lng and sentiment between -10 and +10 */
export function generateDummyNewsData(): NewsDataPoint[] {
  const points: NewsDataPoint[] = [];
  for (let i = 0; i < 50; i++) {
    const latitude = (Math.random() * 160 - 80); // roughly -80 to 80
    const longitude = (Math.random() * 360 - 180);
    const sentiment = Math.round((Math.random() * 20 - 10) * 10) / 10; // -10 to +10, 1 decimal
    points.push({
      id: `dummy-${i + 1}`,
      latitude,
      longitude,
      sentiment,
      headline: `Sample headline ${i + 1} (${sentiment >= 0 ? "positive" : "negative"})`,
      summary: "AI-generated summary will appear here.",
      url: "https://example.com",
      timestamp: new Date().toISOString(),
    });
  }
  return points;
}
