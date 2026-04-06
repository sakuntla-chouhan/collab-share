/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#000000',
        'brand-card': '#121212',
        'brand-primary': '#ffffff',
        'brand-secondary': '#a0a0a0',
      },
    },
  },
  plugins: [],
}
