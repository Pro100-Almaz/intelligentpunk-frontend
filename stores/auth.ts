// stores/auth.ts
import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import { useCookie, navigateTo, useRuntimeConfig } from '#app'


export interface User {
  id: number
  username: string
  email: string
  name?: string
  role?: string
}

interface AuthResponse {
  access: string
  refresh: string
  errors?: Record<string, string[]>
}

interface UserResponse {
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

function setAuthCookies(token: string, user: User, maxAge: number) {
  console.log('[DEBUG] Setting auth cookies with maxAge:', maxAge)
  
  const cookieOpts = {
    default: () => null,
    maxAge,
    sameSite: 'lax' as const,
    secure: false, // Force secure to false for development
    httpOnly: false, // Explicitly set to false
    path: '/' // Ensure cookie is available on all routes
  }
  console.log('[DEBUG] Cookie options:', cookieOpts)

  const authCookie = useCookie<string | null>('auth-token', cookieOpts)
  authCookie.value = token
  console.log('[DEBUG] Set auth-token cookie:', !!authCookie.value)

  const userCookie = useCookie<string | null>('user-data', cookieOpts)
  userCookie.value = JSON.stringify(user)
  console.log('[DEBUG] Set user-data cookie:', !!userCookie.value)
  
  // Force a check immediately after setting
  setTimeout(() => {
    const checkAuth = useCookie<string | null>('auth-token')
    const checkUser = useCookie<string | null>('user-data')
    console.log('[DEBUG] Immediate cookie check:', {
      authToken: !!checkAuth.value,
      userData: !!checkUser.value
    })
  }, 100)
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
    clearErrors() {
      this.authErrors = {}
      this.successMessage = null
    },

    setErrors(errors: Record<string, string[]>) {
      this.authErrors = errors
    },

    setSuccessMessage(msg: string) {
      this.successMessage = msg
      this.authErrors = {}
    },

    async register(payload: { username: string; email: string; password: string }) {
      this.clearErrors()
      try {
        // For now, just return success: false since we're focusing on login
        // You can implement this later based on your register API endpoint
        this.setErrors({ general: ['Registration not implemented yet'] })
        return { success: false }
      } catch (err: any) {
        const msg = err?.data?.errors
          ? err.data.errors
          : { general: [err.message || 'Registration failed'] }
        this.setErrors(msg)
        return { success: false }
      }
    },
    async refreshToken() {
      if (!this.token) return

      const config = useRuntimeConfig()
      try {
        const data = await $fetch<AuthResponse>(`${config.public.apiBase}/api/token/refresh/`, {
          method: 'POST',
          body: { refresh: this.token }
        })
        if (data.access) {
          this.token = data.access
          if (this.user) {
            setAuthCookies(data.access, this.user, 60 * 60 * 24) 
          }
        } else {
          this.logout()
        }
      } catch {
        this.logout()
      }
    },

    async login(payload: { email: string; password: string; remember?: boolean }) {
      this.clearErrors()

      const config = useRuntimeConfig()
      const url = `${config.public.apiBase}/api/token/`

      try {
        console.log('[DEBUG] Making login request to:', url)
        console.log('[DEBUG] Login payload:', { ...payload, password: '***' })
        
        const data = await $fetch<AuthResponse>(url, {
          method: 'POST',
          body: payload
        })

        console.log('[DEBUG] Raw API response:', data)
        console.log('[DEBUG] Response access:', data.access)
        console.log('[DEBUG] Response refresh:', data.refresh)
        console.log('[DEBUG] Response errors:', data.errors)

        if (data.errors) {
          this.setErrors(data.errors)
          return { success: false }
        }

        if (!data.access) {
          this.setErrors({ general: ['No access token received'] })
          return { success: false }
        }

        console.log('[DEBUG] Login successful, getting user info')
        
        // Get user information using the access token
        try {
          const userInfo = await $fetch<UserResponse>(`${config.public.apiBase}/api/users/me/`, {
            headers: {
              'Authorization': `Bearer ${data.access}`
            }
          })
          
          console.log('[DEBUG] User info received:', userInfo)
          
          this.token = data.access
          this.user = userInfo

          const maxAge = payload.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
          setAuthCookies(data.access, userInfo, maxAge)
          
          console.log('[DEBUG] Auth state after login:', {
            token: !!this.token,
            user: !!this.user,
            isLoggedIn: this.isLoggedIn
          })

          return { success: true }
        } catch (userError) {
          console.error('[DEBUG] Failed to get user info:', userError)
          // Even if user info fails, we still have a valid token
          this.token = data.access
          // Create a minimal user object from the token payload if possible
          this.user = {
            id: 0,
            username: payload.email.split('@')[0],
            email: payload.email
          } as User
          
          const maxAge = payload.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
          setAuthCookies(data.access, this.user, maxAge)
          
          return { success: true }
        }
      } catch (err: any) {
        console.error('[DEBUG] Login error:', err)
        const msg = err?.data?.errors
          ? err.data.errors
          : { general: [err.message || 'Login failed'] }
        this.setErrors(msg)
        return { success: false }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.clearErrors()

      useCookie('auth-token').value = null
      useCookie('user-data').value = null

      navigateTo('/login')
    },

    async forgotPassword(email: string) {
      this.clearErrors()
      try {
        const data = await $fetch<{ errors?: Record<string, string[]> }>('/api/auth/forgot-password', {
          method: 'POST',
          body: { email }
        })
        if (data.errors) {
          this.setErrors(data.errors)
          return { success: false }
        }
        this.setSuccessMessage('Check your inbox for password reset instructions.')
        return { success: true }
      } catch (err: any) {
        this.setErrors({ general: [err.message || 'Failed to send reset email'] })
        return { success: false }
      }
    },

    async resetPassword(token: string, newPassword: string) {
      this.clearErrors()
      try {
        const data = await $fetch<{ errors?: Record<string, string[]> }>('/api/auth/reset-password', {
          method: 'POST',
          body: { token, newPassword }
        })
        if (data.errors) {
          this.setErrors(data.errors)
          return { success: false }
        }
        this.setSuccessMessage('Password reset successful. You can now log in.')
        return { success: true }
      } catch (err: any) {
        this.setErrors({ general: [err.message || 'Password reset failed'] })
        return { success: false }
      }
    },

    initAuth() {
      console.log('[DEBUG] Initializing auth state from cookies')

      // If already initialized, skip re-initialization
      if (this.token && this.user) {
        console.log('[DEBUG] Auth already initialized, skipping cookie load')
        return
      }

      const cookieOpts = {
        default: () => null,
        httpOnly: false,
        secure: false,
        path: '/'
      }
      
      const authCookie = useCookie<string | null>('auth-token', cookieOpts)
      const userCookie = useCookie<string | null>('user-data', cookieOpts)
      
      console.log('[DEBUG] Cookie values:', {
        authToken: !!authCookie.value,
        userData: !!userCookie.value
      })
      
      if (authCookie.value && userCookie.value) {
        this.token = authCookie.value
        try {
          this.user = JSON.parse(userCookie.value)
          console.log('[DEBUG] Successfully restored auth state from cookies')
        } catch {
          console.log('[DEBUG] Failed to parse user data, clearing cookies')
          authCookie.value = null
          userCookie.value = null
        }
      } else {
        console.log('[DEBUG] No valid auth cookies found')
      }
      
      console.log('[DEBUG] Final auth state:', {
        token: !!this.token,
        user: !!this.user,
        isLoggedIn: this.isLoggedIn
      })
    }
  }
})
