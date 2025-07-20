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
  
  const isAuthenticated = computed(() => {
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
      const { data, error } = await useFetch<{ access: string; refresh: string }>('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password
        }
      })

      if (error.value) {
        throw error.value
      }

      if (data.value?.access) {
        // Set cookies with appropriate expiration
        const maxAge = credentials.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
        
        // Store access token
        authCookie.value = data.value.access
        
        // Store refresh token
        const refreshCookie = useCookie('refresh-token', {
          default: () => null as string | null,
          maxAge
        })
        refreshCookie.value = data.value.refresh
        
        // Try to get user details from backend
        const userDetails = await getUserDetails()
        if (userDetails) {
          userCookie.value = JSON.stringify(userDetails)
        } else {
          // Fallback to mock user if backend doesn't have user endpoint
          const mockUser = {
            id: 1,
            email: credentials.email,
            username: credentials.email.split('@')[0],
            name: credentials.email.split('@')[0],
            role: 'user'
          }
          userCookie.value = JSON.stringify(mockUser)
        }
        
        return { success: true }
      }

      return { success: false }
    }catch(err: any){}
    // } catch (err: any) {
    //   setErrors({ general: [err.message || 'Login failed'] })
    //   return { success: false }
    // }
  }
  
  // Logout user
  const logout = () => {
    authCookie.value = null
    userCookie.value = null
    
    // Clear refresh token
    const refreshCookie = useCookie('refresh-token')
    refreshCookie.value = null
    
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
  
  // Get user details from backend
  const getUserDetails = async () => {
    if (!authCookie.value) return null
    
    try {
      const { data, error } = await useFetch<User>('http://127.0.0.1:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${authCookie.value}`
        }
      })

      if (error.value) {
        throw error.value
      }

      if (data.value) {
        userCookie.value = JSON.stringify(data.value)
        return data.value
      }

      return null
    } catch (err: any) {
      console.error('Failed to get user details:', err)
      return null
    }
  }
  
  // Initialize auth state from cookies
  const initAuth = async () => {
    if (authCookie.value) {
      try {
        state.token = authCookie.value
        
        // Try to get user details from backend
        const userDetails = await getUserDetails()
        if (userDetails) {
          state.user = userDetails
        } else if (userCookie.value) {
          // Fallback to stored user data
          state.user = JSON.parse(userCookie.value)
        }
      } catch {
        // Invalid cookie data, clear them
        authCookie.value = null
        userCookie.value = null
        const refreshCookie = useCookie('refresh-token')
        refreshCookie.value = null
      }
    }
  }
  
  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    hasErrors: readonly(hasErrors),
    authErrors: readonly(computed(() => state.authErrors)),
    successMessage: readonly(computed(() => state.successMessage)),
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    clearErrors,
    setErrors,
    setSuccessMessage,
    initAuth
  }
} 