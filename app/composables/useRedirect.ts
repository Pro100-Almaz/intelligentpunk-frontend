// composables/useRedirect.ts
import { useRouter, useRoute } from '#app'

export function useRedirect() {
  const router = useRouter()
  const route = useRoute()

  function redirectToLogin() {
    const intended = route.fullPath
    const q = intended !== '/login'
      ? { redirect: intended }
      : {}
    return router.push({ path: '/login', query: q })
  }

  return { redirectToLogin }
}
