import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'inc-blue': '#1e3a5f',
        'inc-blue-light': '#2a5298',
        'inc-blue-hover': '#162d4a',
      },
    },
  },
  plugins: [],
}
export default config
