/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          hover: '#ff5252',
          light: '#FF8A65' // Gradient end
        },
        secondary: '#2EC4B6',
        accent: '#FFD166',
        background: '#FFF9F5',
        card: '#FFFFFF',
        text: {
          heading: '#1F2937',
          body: '#6B7280'
        },
        success: '#22C55E'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 15px 35px -5px rgba(255, 107, 107, 0.2)',
      }
    },
  },
  plugins: [],
}
