import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,astro}"],
  theme: {
    extend: {
      screens: {
        xs: "330px",
        md: "650px",
      },
      backgroundImage: {
        "blurple-wave": "linear-gradient(to top right, #3f6d85, #7e65ad)",
      },
      fontFamily: {
        sans: ["Trebuchet MS", "sans-serif"],
        sleek: ["Varta", "sans-serif"],
      },
      dropShadow: {
        "xl-c": "0px 0px 6px rgba(0, 0, 0, 0.4)",
        "4xl-c": "0px 0px 28px rgba(20, 20, 20, 0.3)",
        "5xl-c": "0px 0px 30px rgba(20, 20, 20, 0.71)",
        "5xl-c-white": "0px 0px 30px rgba(200, 200, 220, 0.39)",
      },
      colors: {
        "slate-100": "#F5F7FA",
        "slate-350": "#adb9c9",
        "gray-350": "#E5E9EF",
        "regal-blue": "#243c5a",
        "link-blue": "#072c42",
        "mid-blue-100": "#4F6482",
        "mid-blue-200": "#3C5375",
        "mid-blue-300": "#3c5375",
        "mid-blue-400": "#364A69",
        "mid-blue-500": "#30425E",
        "mid-blue-600": "#2B3B54",
        "mid-blue-700": "#26354B",
        "mid-blue-800": "#222F43",
        "mid-blue-900": "#1E2A3C",
      },
    },
  },
  plugins: [],
} satisfies Config;
