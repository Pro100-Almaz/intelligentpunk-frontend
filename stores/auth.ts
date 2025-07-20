import { defineStore } from 'pinia'

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

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    authErrors: {},
    successMessage: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    hasErrors: (state) => Object.keys(state.authErrors).length > 0
  },

  actions: {
    // Clear all errors
    clearErrors() {
      this.authErrors = {}
      this.successMessage = null
    },

    // Set errors from API response
    setErrors(errors: Record<string, string[]>) {
      this.authErrors = errors
    },

    // Set success message
    setSuccessMessage(message: string) {
      this.successMessage = message
      this.authErrors = {}
    },

    // Register new user
    async register(credentials: { username: string; email: string; password: string }) {
      this.clearErrors()
      
      try {
        const { data, error } = await useFetch('/api/auth/register', {
          method: 'POST',
          body: credentials
        })

        if (error.value) {
          throw error.value
        }

        if (data.value?.errors) {
          this.setErrors(data.value.errors)
          return { success: false }
        }

        if (data.value?.token && data.value?.user) {
          this.token = data.value.token
          this.user = data.value.user
          
          // Set cookies
          const authCookie = useCookie('auth-token', {
            default: () => null as string | null,
            maxAge: 60 * 60 * 24 * 30 // 30 days
          })
          authCookie.value = data.value.token
          
          const userCookie = useCookie('user-data', {
            default: () => null as string | null,
            maxAge: 60 * 60 * 24 * 30
          })
          userCookie.value = JSON.stringify(data.value.user)
          
          return { success: true }
        }

        return { success: false }
      } catch (err: any) {
        this.setErrors({ general: [err.message || 'Registration failed'] })
        return { success: false }
      }
    },

    // Login user
    async login(credentials: { email: string; password: string; remember?: boolean }) {
      this.clearErrors()
      
      try {
        const { data, error } = await useFetch('/api/auth/login', {
          method: 'POST',
          body: credentials
        })

        if (error.value) {
          throw error.value
        }

        if (data.value?.errors) {
          this.setErrors(data.value.errors)
          return { success: false }
        }

        if (data.value?.token && data.value?.user) {
          this.token = data.value.token
          this.user = data.value.user
          
          // Set cookies with appropriate expiration
          const maxAge = credentials.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
          const authCookie = useCookie('auth-token', {
            default: () => null as string | null,
            maxAge
          })
          authCookie.value = data.value.token
          
          const userCookie = useCookie('user-data', {
            default: () => null as string | null,
            maxAge
          })
          userCookie.value = JSON.stringify(data.value.user)
          
          return { success: true }
        }

        return { success: false }
      } catch (err: any) {
        this.setErrors({ general: [err.message || 'Login failed'] })
        return { success: false }
      }
    },

    // Logout user
    logout() {
      this.user = null
      this.token = null
      this.clearErrors()
      
      // Clear cookies
      const authCookie = useCookie('auth-token')
      const userCookie = useCookie('user-data')
      authCookie.value = null
      userCookie.value = null
      
      navigateTo('/login')
    },

    // Forgot password
    async forgotPassword(email: string) {
      this.clearErrors()
      
      try {
        const { data, error } = await useFetch('/api/auth/forgot-password', {
          method: 'POST',
          body: { email }
        })

        if (error.value) {
          throw error.value
        }

        if (data.value?.errors) {
          this.setErrors(data.value.errors)
          return { success: false }
        }

        this.setSuccessMessage('Check your inbox for password reset instructions.')
        return { success: true }
      } catch (err: any) {
        this.setErrors({ general: [err.message || 'Failed to send reset email'] })
        return { success: false }
      }
    },

    // Reset password
    async resetPassword(token: string, newPassword: string) {
      this.clearErrors()
      
      try {
        const { data, error } = await useFetch('/api/auth/reset-password', {
          method: 'POST',
          body: { token, newPassword }
        })

        if (error.value) {
          throw error.value
        }

        if (data.value?.errors) {
          this.setErrors(data.value.errors)
          return { success: false }
        }

        this.setSuccessMessage('Password reset successful. You can now login with your new password.')
        return { success: true }
      } catch (err: any) {
        this.setErrors({ general: [err.message || 'Password reset failed'] })
        return { success: false }
      }
    },

    // Initialize auth state from cookies
    initAuth() {
      const authCookie = useCookie('auth-token')
      const userCookie = useCookie('user-data')
      
      if (authCookie.value && userCookie.value) {
        try {
          this.token = authCookie.value
          this.user = JSON.parse(userCookie.value)
        } catch {
          // Invalid cookie data, clear them
          authCookie.value = null
          userCookie.value = null
        }
      }
    }
  }
}) 