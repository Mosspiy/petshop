const { default: daisyui } = require('daisyui');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {
      
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light"]
  } 
}
