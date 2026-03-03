# Globe News

A global news sentiment map built with Next.js 14: Mapbox + Deck.gl map, Firebase/Firestore data, GDELT via BigQuery, and AI-powered article summaries (Gemini + Firecrawl). Dark “Bloomberg Terminal”–style UI with glassmorphism.

## Features

- **Live map**: Scatter plot of news events with sentiment-based styling; timeline slider to scrub through time.
- **Summaries**: Click a point → popup with AI summary (What / Why / Where) and article link.
- **Search & fly-to**: Geocode a place and fly the map there; auto-rotate when idle.
- **Tension meter**: Aggregate sentiment (CRITICAL / ELEVATED / STABLE / PEACEFUL) and radar-style “breaking” pulse.

## Prerequisites

- Node.js 18+
- [Mapbox](https://account.mapbox.com/) access token
- [Google AI Studio](https://aistudio.google.com/apikey) (Gemini) API key
- [Firecrawl](https://firecrawl.dev) API key (for scraping article content)
- Google Cloud project with BigQuery + a service account (for GDELT)
- Firebase project with Firestore (for storing news events)

## Quick start

1. **Clone and install**

   ```bash
   git clone https://github.com/YOUR_USERNAME/globe-news.git
   cd globe-news
   npm install
   ```

2. **Environment variables**

   Copy the example env file and fill in your keys:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`. Required variables:

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox public token (map tiles) |
   | `GEMINI_API_KEY` | Google AI Studio key (summaries) |
   | `FIRECRAWL_API_KEY` | Firecrawl API key (article scraping) |
   | `CRON_SECRET` | Secret for protecting `/api/gdelt` (e.g. from Cloud Scheduler) |

   For GDELT and Firebase you also need:

   - **Google Cloud**: Create a service account with BigQuery access; download its JSON key. Set in `.env.local`:
     - `GOOGLE_APPLICATION_CREDENTIALS` = path to that JSON file (or put the path in the JSON file and reference it).
     - Alternatively, some setups use `GCP_PROJECT_ID` and the path to the key; ensure your GDELT route can load credentials (see `app/api/gdelt/route.ts`).
   - **Firebase**: Use a Firebase Admin SDK service account JSON. Set:
     - `FIREBASE_ADMIN_SDK_KEY` or the path to the JSON (e.g. `news-map-backend-firebase-adminsdk-....json`) so the app can initialize Firebase Admin. Do **not** commit this file; it’s in `.gitignore`.

   See `.env.local.example` for the list of variable names. Use strong random values for `CRON_SECRET` in production.

3. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production build**

   ```bash
   npm run build
   npm start
   ```

## Project structure

- `app/` — Next.js App Router: `page.tsx`, `layout.tsx`, and API routes.
- `app/api/news/route.ts` — Reads news events from Firestore (used by the map).
- `app/api/gdelt/route.ts` — Fetches GDELT from BigQuery and writes to Firestore; protected by `?secret=CRON_SECRET`.
- `app/api/summarize/route.ts` — Fetches URL with Firecrawl, summarizes with Gemini, returns image + What/Why/Where.
- `components/` — `NewsSentimentMap.tsx` (map, layers, timeline, flyTo), `NewsPopup.tsx`, `SearchBar.tsx`, `TimelineSlider.tsx`, `TensionMeter.tsx`.

## Deploy (e.g. Vercel)

1. Push the repo to GitHub and import the project in Vercel.
2. Add the same environment variables in the Vercel project settings (do not commit `.env.local`).
3. For GDELT updates, call your deployed URL from a cron (e.g. [Google Cloud Scheduler](https://cloud.google.com/scheduler)):
   `GET https://your-app.vercel.app/api/gdelt?secret=YOUR_CRON_SECRET`
4. Ensure Firebase and Google Cloud credentials are available (env vars or secure secret storage as per your host).

## License

MIT.
