import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:   "#0D1B2A",
          mid:    "#1A3A5C",
          accent: "#00A8E8",
          light:  "#E8F4FD",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
