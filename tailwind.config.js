/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/webApp/**/*.{js,jsx,ts,tsx}",
      "./src/public/webapp.html"
    ],
    theme: {
      extend: {
        colors: {
          telegram: {
            bg: 'var(--tg-theme-bg-color)',
            text: 'var(--tg-theme-text-color)',
            hint: 'var(--tg-theme-hint-color)',
            link: 'var(--tg-theme-link-color)',
            button: 'var(--tg-theme-button-color)',
            'button-text': 'var(--tg-theme-button-text-color)',
          }
        }
      },
    },
    plugins: [],
  }