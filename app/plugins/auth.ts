// plugins/auth.ts
import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~~/stores/auth'

// Initialize auth on client side after Pinia is ready
// Plugin name starts with '0' to ensure it runs before 'api.ts' plugin
export default defineNuxtPlugin({
  name: '0-auth-init',
  async setup() {
    // Only initialize auth on client side where Pinia is available
    if (import.meta.client) {
      const auth = useAuthStore()
      // Initialize auth state on app start (restore from localStorage or fetch from backend)
      await auth.initAuth()
    }
  }
})
