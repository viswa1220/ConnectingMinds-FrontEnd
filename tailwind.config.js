/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        "midnight-dev": {
          "primary": "#3B82F6",
          "secondary": "#6366F1",
          "accent": "#10B981",  // A pop of green for accents if needed
          "neutral": "#1E1E2F", // Card and panel backgrounds
          "base-100": "#121212", // Main background color
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
          // You can customize further based on DaisyUI variables
        },
      },
      "dark", // You can also fall back to DaisyUI's built-in dark theme if needed
    ],
  },
}

