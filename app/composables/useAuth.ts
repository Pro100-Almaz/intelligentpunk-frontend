// composables/useAuth.ts
import { useRouter, useRoute, navigateTo } from '#app'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~~/stores/auth'

export function useAuth() {
  const auth   = useAuthStore()
  const router = useRouter()
  const route  = useRoute()

  // pull reactive refs out of the store
  const { authErrors, user } = storeToRefs(auth)
  async function login(creds: { email: string; password: string; remember?: boolean }) {
    const result = await auth.login(creds)
    
    if (result.success) {
      // Redirect to dashboard (index.vue at root '/') or to the redirect query param if present
      const redirectTo = (route.query.redirect as string) || '/'
      await navigateTo(redirectTo)
    }
    return result
  }

  async function register(payload: { username: string; email: string; password: string, password_confirm: string }) {
    return await auth.register(payload)
  }

  async function logout() {
    await auth.logout()
    // Redirect to login page after logout
    await navigateTo('/login')
  }

  return {
    login,
    register,
    authErrors,
    isLoggedIn: computed(() => auth.isLoggedIn),
    user,
    logout,
  }
}
