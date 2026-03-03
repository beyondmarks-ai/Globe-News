export interface NewsDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  sentiment: number; // -10 to +10
  headline: string;
  summary?: string;
  url?: string;
  timestamp?: string;
}

/** Sentiment color: negative = Neon Crimson #FF3366, positive = Neon Emerald #00E676 */
export function getSentimentColor(sentiment: number): [number, number, number] {
  if (sentiment >= 0) {
    // Positive: #00E676 -> RGB(0, 230, 118)
    return [0, 230, 118];
  }
  // Negative: #FF3366 -> RGB(255, 51, 102)
  return [255, 51, 102];
}
