// plugins/auth.ts
import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~~/stores/auth'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  // Initialize once on app start if not already set
  if (!auth.token || !auth.user) {
    auth.initAuth()
  }
})
