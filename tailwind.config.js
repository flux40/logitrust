/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#07152B",
        gold: "#F4B400",
      },
      backgroundColor: {
        'navy': '#07152B',
        'gold': '#F4B400',
      },
      textColor: {
        'navy': '#07152B',
        'gold': '#F4B400',
      },
      borderColor: {
        'gold': '#F4B400',
      },
    },
  },
  plugins: [],
}