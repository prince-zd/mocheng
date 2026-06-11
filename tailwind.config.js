/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#333333',
        cinnabar: '#1a1a1a',
        paper: '#f5eddc',
        soot: '#111111'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        duobaota: ['"AaYZQDBTB"', 'serif'],
        calligraphy: [
          '"AaYZQDBTB"',
          '"Moyun-WangXizhi-SCFwxz"',
          'serif'
        ]
      },
      boxShadow: {
        soft: '0 18px 42px rgba(26, 26, 26, 0.06)'
      }
    }
  },
  plugins: []
}
