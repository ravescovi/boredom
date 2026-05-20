import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        cream: "#FFF8E1",
        paper: "#FFFCF0",
        butter: "#FFE45C",
        hot: "#FF5C8A",
        mint: "#5BE0B0",
        sky: "#8AD7FF",
        lilac: "#C9B6FF"
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        brut: "4px 4px 0 #1A1A1A",
        "brut-lg": "6px 6px 0 #1A1A1A",
        "brut-xl": "10px 10px 0 #1A1A1A",
        "brut-2xl": "12px 12px 0 #1A1A1A",
        "brut-sm": "3px 3px 0 #1A1A1A",
        "brut-press": "2px 2px 0 #1A1A1A"
      }
    }
  },
  plugins: []
};

export default config;
