# Globe News — Step 1 Setup

## 1. Install dependencies

From the project root run:

```bash
npm install
```

### Packages installed (Step 1)

| Package | Purpose |
|--------|--------|
| `next` | Next.js 14+ (App Router) |
| `react`, `react-dom` | React 18 |
| `mapbox-gl` | Mapbox GL JS (base map + dark style) |
| `react-map-gl` | React wrapper for Mapbox + `useControl` for Deck overlay |
| `deck.gl` | WebGL layers (ScatterplotLayer) |
| `@deck.gl/mapbox` | MapboxOverlay to render deck.gl on top of Mapbox |
| `framer-motion` | Animations (for later steps) |
| `tailwind-merge`, `clsx`, `class-variance-authority`, `@radix-ui/react-slot` | Tailwind + Shadcn-style utilities |
| `tailwindcss`, `postcss`, `autoprefixer` | Tailwind CSS |
| `typescript`, `@types/*` | TypeScript and type definitions |

## 2. Mapbox API key

1. **Create a Mapbox account** (free tier is enough):  
   [https://account.mapbox.com/](https://account.mapbox.com/)

2. **Create an access token**  
   In the Mapbox dashboard → **Access tokens** → **Create a token**.  
   Keep the default public scopes (e.g. `styles:tiles`, `vector:read`) so the dark style can load.

3. **Add the token to your project**  
   - Copy the root `.env.local.example` to `.env.local`:
     ```bash
     cp .env.local.example .env.local
     ```
   - Open `.env.local` and replace `your_mapbox_public_access_token_here` with your token:
     ```
     NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSI...
     ```

4. **Why this file?**  
   - `.env.local` is not committed (add it to `.gitignore` if needed).  
   - The `NEXT_PUBLIC_` prefix exposes the variable to the browser so the map can use it when requesting Mapbox tiles.

## 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see a full-screen dark map with 50 glowing dots: **crimson** (#FF3366) for negative sentiment and **emerald** (#00E676) for positive sentiment.

## 4. If you see “Mapbox token required”

- Ensure `.env.local` exists and contains `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...`.
- Restart the dev server (`Ctrl+C`, then `npm run dev`) after changing env vars.
