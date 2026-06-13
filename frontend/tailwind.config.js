/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          navy: '#0a192f',
          dark: '#020c1b',
          card: '#112240',
          hover: '#233554',
          slate: '#8892b0',
          light: '#ccd6f6',
          gold: '#f59e0b',
          crimson: '#f43f5e',
          success: '#10b981',
          border: '#1d2d50'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-gold': '0 0 15px rgba(245, 158, 11, 0.4)',
        'neon-navy': '0 0 20px rgba(35, 53, 84, 0.5)'
      }
    },
  },
  plugins: [],
}
