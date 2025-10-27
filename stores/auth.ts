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
  token: string | null         // access token
  refreshToken: string | null  // refresh token
  authErrors: Record<string, string[]>
  successMessage: string | null
}

/**
 * Helper to store tokens and user info in cookies
 */
function setAuthCookies(access: string, refresh: string, user: User, maxAge: number) {
  console.log('[DEBUG] Setting auth cookies (maxAge:', maxAge, ')')

  const cookieOpts = {
    default: () => null,
    maxAge,
    sameSite: 'lax' as const,
    secure: false,
    httpOnly: false,
    path: '/'
  }

  const accessCookie = useCookie<string | null>('auth-token', cookieOpts)
  const refreshCookie = useCookie<string | null>('refresh-token', cookieOpts)
  const userCookie = useCookie<string | null>('user-data', cookieOpts)

  accessCookie.value = access
  refreshCookie.value = refresh
  userCookie.value = JSON.stringify(user)

  console.log('[DEBUG] Cookies set successfully:', {
    access: !!accessCookie.value,
    refresh: !!refreshCookie.value,
    user: !!userCookie.value
  })
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
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

    /**
     * 🔐 Login and store both tokens
     */
    async login(payload: { email: string; password: string; remember?: boolean }) {
      this.clearErrors()
      const config = useRuntimeConfig()
      const url = `${config.public.apiBase}/api/token/`

      try {
        console.log('[DEBUG] Sending login request to:', url)
        const data = await $fetch<AuthResponse>(url, {
          method: 'POST',
          body: payload
        })

        console.log('[DEBUG] Login response:', data)

        if (data.errors) {
          this.setErrors(data.errors)
          return { success: false }
        }

        if (!data.access || !data.refresh) {
          this.setErrors({ general: ['Invalid token response'] })
          return { success: false }
        }

        // Fetch user info
        const userInfo = await $fetch<UserResponse>(`${config.public.apiBase}/api/users/me/`, {
          headers: { Authorization: `Bearer ${data.access}` }
        })

        this.token = data.access
        this.refreshToken = data.refresh
        this.user = userInfo

        const maxAge = payload.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
        setAuthCookies(data.access, data.refresh, userInfo, maxAge)

        console.log('[DEBUG] Login successful:', {
          token: !!this.token,
          refresh: !!this.refreshToken,
          user: this.user?.email
        })

        return { success: true }
      } catch (err: any) {
        console.error('[DEBUG] Login error:', err)
        const msg = err?.data?.errors
          ? err.data.errors
          : { general: [err.message || 'Login failed'] }
        this.setErrors(msg)
        return { success: false }
      }
    },

    /**
     * 🔁 Use refresh token to get new access token
     */
    async refreshTokenIfNeeded() {
      if (!this.refreshToken) {
        console.warn('[DEBUG] No refresh token available')
        return false
      }

      const config = useRuntimeConfig()
      try {
        console.log('[DEBUG] Refreshing access token...')
        const data = await $fetch<AuthResponse>(`${config.public.apiBase}/api/token/refresh/`, {
          method: 'POST',
          body: { refresh: this.refreshToken }
        })

        if (data.access) {
          this.token = data.access

          const accessCookie = useCookie<string | null>('auth-token')
          accessCookie.value = data.access

          console.log('[DEBUG] Access token refreshed successfully')
          return true
        } else {
          console.warn('[DEBUG] Refresh failed - no access token returned')
          this.logout()
          return false
        }
      } catch (err) {
        console.error('[DEBUG] Token refresh error:', err)
        this.logout()
        return false
      }
    },

    /**
     * 🚪 Log out user and clear cookies
     */
    logout() {
      console.log('[DEBUG] Logging out user')
      this.user = null
      this.token = null
      this.refreshToken = null
      this.clearErrors()

      useCookie('auth-token').value = null
      useCookie('refresh-token').value = null
      useCookie('user-data').value = null

      navigateTo('/login')
    },

    /**
     * 💾 Restore user and tokens from cookies
     */
    initAuth() {
      console.log('[DEBUG] Initializing auth from cookies')

      const cookieOpts = {
        default: () => null,
        httpOnly: false,
        secure: false,
        path: '/'
      }

      const accessCookie = useCookie<string | null>('auth-token', cookieOpts)
      const refreshCookie = useCookie<string | null>('refresh-token', cookieOpts)
      const userCookie = useCookie<string | null>('user-data', cookieOpts)

      console.log('[DEBUG] Cookie check:', {
        access: !!accessCookie.value,
        refresh: !!refreshCookie.value,
        user: !!userCookie.value
      })

      if (accessCookie.value && userCookie.value) {
        this.token = accessCookie.value
        this.refreshToken = refreshCookie.value
        try {
          this.user = JSON.parse(userCookie.value)
          if (this.user) {
            console.log('[DEBUG] Restored user from cookies:', this.user.email)
          } else {
            console.log('[DEBUG] User is null, cannot restore email')
          }
        } catch {
          console.error('[DEBUG] Failed to parse user cookie')
          this.user = null
        }
      } else {
        console.log('[DEBUG] No valid auth cookies found')
      }

      console.log('[DEBUG] Final auth state:', {
        token: !!this.token,
        refresh: !!this.refreshToken,
        isLoggedIn: this.isLoggedIn
      })
    },

    /**
 * 🧾 Register new user
 */
    async register(payload: { username: string; email: string; password: string, password_confirm: string }) {
      this.clearErrors()
      const config = useRuntimeConfig()
      const url = `${config.public.apiBase}/api/users/register/client/`

      try {
        console.log('[DEBUG] Sending registration request to:', url)
        const data = await $fetch<AuthResponse>(url, {
          method: 'POST',
          body: payload
        })

        console.log('[DEBUG] Registration response:', data)

        if (data.errors) {
          this.setErrors(data.errors)
          return { success: false }
        }

        // Some APIs return tokens upon registration
        if (data.access && data.refresh) {
          const userInfo = await $fetch<UserResponse>(`${config.public.apiBase}/api/users/me/`, {
            headers: { Authorization: `Bearer ${data.access}` }
          })

          this.token = data.access
          this.refreshToken = data.refresh
          this.user = userInfo

          const maxAge = 60 * 60 * 24
          setAuthCookies(data.access, data.refresh, userInfo, maxAge)

          this.setSuccessMessage('Registration successful!')
          return { success: true }
        }

        // If backend doesn’t return tokens immediately
        this.setSuccessMessage('Account created successfully. Please log in.')
        return { success: true }
      } catch (err: any) {
        console.error('[DEBUG] Registration error:', err)
        const msg = err?.data?.errors
          ? err.data.errors
          : { general: [err.message || 'Registration failed'] }
        this.setErrors(msg)
        return { success: false }
      }
    },


    /**
     * 🧠 Example: request password reset
     */
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

    /**
     * 🔒 Reset password using token
     */
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
    }
  }
})
