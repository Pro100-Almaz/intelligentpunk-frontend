// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: { preset: 'vercel' },           // Node/Serverless
  content: {
    experimental: {
      sqliteConnector: 'better-sqlite3'
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    '@vueuse/nuxt',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt'
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  }, 

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  router: {
    options: {
      strict: false
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://127.0.0.1:8000',
      aiApiBase: process.env.NUXT_PUBLIC_AI_API_BASE || 'https://chat.project-x.space/api/v1',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePriceStarter: process.env.NUXT_PUBLIC_STRIPE_PRICE_STARTER,
      stripePricePro: process.env.NUXT_PUBLIC_STRIPE_PRICE_PRO,
      stripePriceEnterprise: process.env.NUXT_PUBLIC_STRIPE_PRICE_ENTERPRISE
    }
  },

  
})