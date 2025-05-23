const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ألوان مرتبطة بمتغيرات CSS
        'beige-light': 'var(--color-beige-light)',
        'brown-dark': 'var(--color-brown-dark)',
        'olive-green': 'var(--color-olive-green)',
        'cream-gray': 'var(--color-cream-gray)',
        'golden-calm': 'var(--color-golden-calm)',
        'blue-muted': 'var(--color-blue-muted)',

        // اللون الأساسي
        primary: {
          DEFAULT: 'var(--color-olive-green)',
          50: '#e8f9f0',
          100: '#c2eed7',
          200: '#98e2bb',
          300: '#6dd7a0',
          400: '#47cc89',
          500: 'var(--color-olive-green)',
          600: '#177245',
          700: '#105635',
          800: '#093b25',
          900: '#041f14',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),

    // المتغيرات الديناميكية للوضعين
    plugin(function ({ addBase }) {
      addBase({
        ':root': {
          '--color-beige-light': '#fdfaf6',
          '--color-brown-dark': '#3c2f2f',
          '--color-olive-green': '#177245',
          '--color-cream-gray': '#f0eae0',
          '--color-golden-calm': '#c2a85d',
          '--color-blue-muted': '#7d9ca8',
        },
        '.dark': {
          '--color-beige-light': '#121212',
          '--color-brown-dark': '#f3f3f3',
          '--color-olive-green': '#30c176',
          '--color-cream-gray': '#1d1d1d',
          '--color-golden-calm': '#e4c76f',
          '--color-blue-muted': '#a4c3ce',
        }
      })
    })
  ]
}
