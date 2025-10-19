import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: "#c15f3c",
          "red-dark": "#ab3207",
          "red-light": "#d4735a",
        },
        success: {
          green: "#10b981",
          "green-dark": "#059669",
          "green-light": "#34d399",
        },
      },
    },
  },
  plugins: [],
};
export default config;

