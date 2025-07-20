export interface User {
  id: number
  username: string
  email: string
  name?: string
  role?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  authErrors: Record<string, string[]>
  successMessage: string | null
}

export const useAuth = () => {
  const authCookie = useCookie('auth-token')
  const userCookie = useCookie('user-data')
  
  const state = reactive<AuthState>({
    user: null,
    token: null,
    authErrors: {},
    successMessage: null
  })
  
  const user = computed(() => {
    if (!userCookie.value) return null
    try {
      return JSON.parse(userCookie.value)
    } catch {
      return null
    }
  })
  
  const isLoggedIn = computed(() => {
    return !!authCookie.value && !!user.value
  })
  
  const hasErrors = computed(() => {
    return Object.keys(state.authErrors).length > 0
  })
  
  // Clear all errors
  const clearErrors = () => {
    state.authErrors = {}
    state.successMessage = null
  }
  
  // Set errors from API response
  const setErrors = (errors: Record<string, string[]>) => {
    state.authErrors = errors
  }
  
  // Set success message
  const setSuccessMessage = (message: string) => {
    state.successMessage = message
    state.authErrors = {}
  }
  
  // Register new user
  const register = async (credentials: { username: string; email: string; password: string }) => {
    clearErrors()
    
    try {
      const { data, error } = await useFetch<{ token?: string; user?: User; errors?: Record<string, string[]> }>('/api/auth/register', {
        method: 'POST',
        body: credentials
      })

      if (error.value) {
        throw error.value
      }

      if (data.value?.errors) {
        setErrors(data.value.errors)
        return { success: false }
      }

      if (data.value?.token && data.value?.user) {
        // Set cookies
        const maxAge = 60 * 60 * 24 * 30 // 30 days
        authCookie.value = data.value.token
        userCookie.value = JSON.stringify(data.value.user)
        
        return { success: true }
      }

      return { success: false }
    } catch (err: any) {
      setErrors({ general: [err.message || 'Registration failed'] })
      return { success: false }
    }
  }
  
  // Login user
  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    clearErrors()
    
    try {
      const { data, error } = await useFetch<{ token?: string; user?: User; errors?: Record<string, string[]> }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (error.value) {
        throw error.value
      }

      if (data.value?.errors) {
        setErrors(data.value.errors)
        return { success: false }
      }

      if (data.value?.token && data.value?.user) {
        // Set cookies with appropriate expiration
        const maxAge = credentials.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
        authCookie.value = data.value.token
        userCookie.value = JSON.stringify(data.value.user)
        
        return { success: true }
      }

      return { success: false }
    } catch (err: any) {
      setErrors({ general: [err.message || 'Login failed'] })
      return { success: false }
    }
  }
  
  // Logout user
  const logout = () => {
    authCookie.value = null
    userCookie.value = null
    clearErrors()
    navigateTo('/login')
  }
  
  // Forgot password
  const forgotPassword = async (email: string) => {
    clearErrors()
    
    try {
      const { data, error } = await useFetch<{ errors?: Record<string, string[]> }>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })

      if (error.value) {
        throw error.value
      }

      if (data.value?.errors) {
        setErrors(data.value.errors)
        return { success: false }
      }

      setSuccessMessage('Check your inbox for password reset instructions.')
      return { success: true }
    } catch (err: any) {
      setErrors({ general: [err.message || 'Failed to send reset email'] })
      return { success: false }
    }
  }
  
  // Reset password
  const resetPassword = async (token: string, newPassword: string) => {
    clearErrors()
    
    try {
      const { data, error } = await useFetch<{ errors?: Record<string, string[]> }>('/api/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword }
      })

      if (error.value) {
        throw error.value
      }

      if (data.value?.errors) {
        setErrors(data.value.errors)
        return { success: false }
      }

      setSuccessMessage('Password reset successful. You can now login with your new password.')
      return { success: true }
    } catch (err: any) {
      setErrors({ general: [err.message || 'Password reset failed'] })
      return { success: false }
    }
  }
  
  // Initialize auth state from cookies
  const initAuth = () => {
    if (authCookie.value && userCookie.value) {
      try {
        state.token = authCookie.value
        state.user = JSON.parse(userCookie.value)
      } catch {
        // Invalid cookie data, clear them
        authCookie.value = null
        userCookie.value = null
      }
    }
  }
  
  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    hasErrors: readonly(hasErrors),
    authErrors: readonly(computed(() => state.authErrors)),
    successMessage: readonly(computed(() => state.successMessage)),
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    clearErrors,
    setErrors,
    setSuccessMessage,
    initAuth
  }
} 