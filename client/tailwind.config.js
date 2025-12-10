// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Next.js standard paths
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Explicitly scan the src directory where your HackTrack components are located
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Define your custom theme colors explicitly
        'hack-bg-dark': '#0a0a0a',
        'hack-fg-light': '#ededed',
        'hack-bg-light': '#ffffff',
        'hack-fg-dark': '#171717',
      },
    },
  },
  plugins: [],
}