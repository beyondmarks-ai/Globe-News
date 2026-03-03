import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bloomberg Terminal × Sci‑Fi dark theme
        background: "hsl(222 47% 6%)",
        foreground: "hsl(210 40% 98%)",
        card: "hsl(222 47% 8%)",
        "card-foreground": "hsl(210 40% 98%)",
        muted: "hsl(217 33% 17%)",
        "muted-foreground": "hsl(215 20% 65%)",
        border: "hsl(217 33% 17%)",
        // Sentiment colors (use in components)
        "negative-glow": "#FF3366",
        "positive-glow": "#00E676",
        crimson: "#FF3366",
        emerald: "#00E676",
      },
      boxShadow: {
        "glow-crimson": "0 0 20px rgba(255, 51, 102, 0.6), 0 0 40px rgba(255, 51, 102, 0.3)",
        "glow-emerald": "0 0 20px rgba(0, 230, 118, 0.6), 0 0 40px rgba(0, 230, 118, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
