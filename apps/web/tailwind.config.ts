import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        mist: "#f5f5f2",
        meadow: "#2f6f4e",
        coral: "#d86443"
      }
    }
  },
  plugins: []
};

export default config;
