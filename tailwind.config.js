/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rezi: {
          blue: '#1652f0',
          dark: '#111827',
          surface: '#f8fafc',
          card: '#ffffff',
          accent: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        roboto: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        merriweather: ['Merriweather', 'Georgia', 'serif'],
        lora: ['Lora', 'Georgia', 'serif'],
        jetbrains: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
