/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00B894",
        secondary: "#6C5CE7",
        background: "#F9F9F9",
        text: "#2D3436",
        surface: "#FFFFFF",
        badge: "#FFD32A",
      },
      fontFamily: {
        header: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}