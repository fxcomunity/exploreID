// tailwind.config.cjs
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00BFFF', // cyan
        background: '#0A0F24',
        surface: '#141B38',
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#FF4D4F',
      },
    },
  },
  plugins: [],
};
