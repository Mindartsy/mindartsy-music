/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        mindartsy: {
          bg: '#101114',
          sidebar: '#17181C',
          card: '#202126',
          hover: '#2A2C31',
          text: '#F5F5F2',
          muted: '#A3A5AA',
          accent: '#B9D9C3',
          divider: '#303137',
        },
      },
    },
  },
  plugins: [],
};
