/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030712', // ultra-deep dark backdrop
          900: '#0b0f19', // card backgrounds
          800: '#111827', // borders and elevated elements
          700: '#1f2937', // subtle dividers
        },
        neon: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          pink: '#ec4899',
          amber: '#f59e0b',
        }
      },
      boxShadow: {
        'neon-violet': '0 0 25px -5px rgba(139, 92, 246, 0.45)',
        'neon-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'neon-pink': '0 0 25px -5px rgba(236, 72, 153, 0.45)',
      },
    },
  },
  plugins: [],
}