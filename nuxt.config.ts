export default defineNuxtConfig({
 

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/image'
  ],

  css: ['~/assets/css/tailwind.css'],

  app: {
    head: {
      htmlAttrs: {
        dir: 'rtl',
        lang: 'ar'
      },
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [
        '/',
        '/lessons',
        '/lessons/*',
        '/books',
        '/study',
        '/ask',
        '/about',
        '/leaderboard',
        '/live',
        '/signup', 
        '/confirm',
        '/forgot-password',
        '/reset-password',
      ],
      cookieRedirect: false
    }
  },

  routeRules: {
    '/admin/**': { ssr: false },
  },

  compatibilityDate: '2025-04-09'
})
