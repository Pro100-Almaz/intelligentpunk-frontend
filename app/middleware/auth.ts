// middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  // Initialize auth state from cookies only if not already set
  if (!auth.token || !auth.user) {
    auth.initAuth()
  }

  // Public auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isProtectedRoute = !authPages.includes(to.path)

  // If there's a token, verify it with backend; if invalid/expired, clear auth
  if (auth.token) {
    try {
      await $fetch(`${config.public.apiBase}/api/token/verify/`, {
        method: 'POST',
        body: { token: auth.token }
      })
    } catch {
      // Token invalid/expired → clear and redirect if needed
      auth.logout()
      if (isProtectedRoute) {
        return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
      }
      return
    }
  }

  // No token or not logged in → redirect for protected routes
  if (isProtectedRoute && !auth.isLoggedIn && to.path !== '/login') {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
