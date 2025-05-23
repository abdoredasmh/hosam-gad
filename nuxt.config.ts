// nuxt.config.ts
export default defineNuxtConfig({

 

  devtools: { enabled: true },

  

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    // '@nuxt/icon', // افترضنا إزالته
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
    classSuffix: '', // مهم لـ Tailwind
    storageKey: 'nuxt-color-mode'
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [ // الصفحات العامة فقط هنا
        '/',
        // --- لا تضع /admin/** هنا ---
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

  // --- هذا هو المكان الصحيح لتعطيل SSR ---
  // --------------------------------------
  // compatibilityDate: '2025-04-08' // يمكنك الاحتفاظ به أو إزالته
  routeRules: {
    // تعطيل SSR لجميع المسارات التي تبدأ بـ /admin/
    '/admin/**': { ssr: false },
  },

  compatibilityDate: '2025-04-09'
})