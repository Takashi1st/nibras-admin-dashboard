import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f2ca50",
          container: "#d4af37",
          fixed: "#ffe088",
          dark: "#b8972e",
        },
        secondary: {
          DEFAULT: "#4edea3",
          container: "#00a572",
          fixed: "#6ffbbe",
          dark: "#10b981",
        },
        surface: {
          DEFAULT: "#0f131d",
          bright: "#353944",
          dim: "#0f131d",
          lowest: "#0a0e18",
          low: "#171b26",
          container: "#1c1f2a",
          high: "#262a35",
          highest: "#313540",
        },
        "on-surface": {
          DEFAULT: "#dfe2f1",
          variant: "#d0c5af",
          muted: "#94a3b8",
        },
        outline: {
          DEFAULT: "#99907c",
          variant: "#4d4635",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
