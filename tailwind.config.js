/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          light: "#F7F8FA",
          dark: "#0B1220",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#131C2E",
        },
        edge: {
          light: "#E2E5EA",
          dark: "#22314A",
        },
        ink: {
          light: "#1A2233",
          dark: "#E7ECF3",
        },
        muted: {
          light: "#6B7385",
          dark: "#8C99B3",
        },
        signal: {
          DEFAULT: "#14B8A6",
          soft: "#2DD4BF",
        },
        warn: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
