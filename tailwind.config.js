/** @type {import('tailwindcss').Config} */
export default {
  // This tells Tailwind exactly which files to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // This is where we define your custom Xeia Finance colors!
      // By putting them inside 'extend', you keep all of Tailwind's default colors
      // but add your specific hex codes as custom utilities.
      colors: {
        blueJeans: '#214573',
        goldenYellow: '#EDA340',
        blueVelvet: '#091D38',
        goldStars: '#AF7A2B',
        tangerine: '#F47729'
      }
    },
  },
  plugins: [],
}