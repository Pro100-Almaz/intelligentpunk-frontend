export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()
  
  // If trying to access auth pages while authenticated, redirect to dashboard
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  if (authPages.includes(to.path) && isAuthenticated.value) {
    return navigateTo('/')
  }
  
  // If trying to access protected pages while not authenticated, redirect to login
  const protectedRoutes = ['/', '/customers', '/inbox', '/settings']
  if (protectedRoutes.includes(to.path) && !isAuthenticated.value) {
    return navigateTo('/login')
  }
}) 