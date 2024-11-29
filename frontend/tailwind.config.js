/** @type {import('tailwindcss').Config} */
import twGlow from "twglow";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [twGlow],
}

