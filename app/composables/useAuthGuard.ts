export const useAuthGuard = () => {
  const { isLoggedIn } = useAuth()
  const route = useRoute()
  
  // Check if user is authenticated and redirect if not
  const requireAuth = (action?: string) => {
    if (!isLoggedIn.value) {
      const message = action 
        ? `Please login to ${action}.` 
        : 'Please login to access this feature.'
      
      alert(message)
      const { redirectToLogin } = useRedirect()
      redirectToLogin()
      return false
    }
    return true
  }
  
  // Check if current route requires authentication
  const isProtectedRoute = () => {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
    return !authPages.includes(route.path)
  }
  
  // Check if user should be redirected to login
  const shouldRedirectToLogin = () => {
    return isProtectedRoute() && !isLoggedIn.value
  }
  
  // Handle authentication for specific actions
  const guardAction = (action: string, callback: () => void) => {
    if (requireAuth(action)) {
      callback()
    }
  }
  
  return {
    requireAuth,
    isProtectedRoute,
    shouldRedirectToLogin,
    guardAction
  }
} 