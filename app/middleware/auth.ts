// middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // On client side, ensure auth is initialized before checking authentication status
  // This ensures user data is restored from localStorage/cookie before middleware runs
  if (import.meta.client) {
    // Reset initialized flag if it was set on server but user is not restored
    // This allows re-initialization on client side where localStorage/cookies are available
    if (auth.initialized && !auth.user) {
      auth.initialized = false
    }
    
    // Initialize auth if not already initialized
    if (!auth.initialized) {
      await auth.initAuth()
    }
  }

  // Skip auth check on server side (will be handled on client)
  if (!import.meta.client) {
    return
  }

  // Public auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.includes(to.path)

  // If user is authenticated and tries to access auth pages, redirect to home
  if (isAuthPage && auth.isLoggedIn) {
    return navigateTo('/')
  }

  // If user is not authenticated and tries to access protected route, redirect to login
  if (!isAuthPage && !auth.isLoggedIn) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
