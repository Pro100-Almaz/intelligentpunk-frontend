// composables/useAuth.ts
import { useRouter, useRoute } from '#app'
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
    console.log('[DEBUG] useAuth login called')
    const result = await auth.login(creds)
    console.log('[DEBUG] Auth store login result:', result)
    
    if (result.success) {
      const to = (route.query.redirect as string) || '/'
      console.log('[DEBUG] Redirecting to:', to)
      console.log('[DEBUG] Current route query:', route.query)
      
      try {
        await router.push(to)
        console.log('[DEBUG] Router push completed successfully')
      } catch (error) {
        console.error('[DEBUG] Router push failed:', error)
      }
    }
    return result
  }

  return {
    login,
    authErrors,
    isLoggedIn: computed(() => auth.isLoggedIn),
    user,
    logout: auth.logout,
  }
}
