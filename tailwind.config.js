/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#_next',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'railway_blue': '#0162B1',
        'primary': '#4096ff',
        'railway_gray': "#8697A8",
        'railway_error': '#d32f2f',
        'railway_303': '#303133'
      },
      backgroundImage: {
        'login': 'url(/WaveLine.svg)',
      },
      spacing: {
        "13": '3.25rem',
        "100": '25rem',
        '150': '9.375rem',
        '161': '40.25rem',
      },
    },
  },
  plugins: [],
}
