import { defineStore } from 'pinia'

export type User = {
  id: string
  email: string
  name?: string
  username?: string
  avatar?: string
}

type LoginDto = {
  email: string,
  password: string,
  remember?: boolean
}

type RegisterDto = {
  email: string,
  password: string,
  name?: string,
  username?: string,
  password_confirm?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,

    // If your backend uses Bearer tokens instead of cookies, set to 'bearer'
    mode: 'cookie' as 'cookie' | 'bearer',

    // Only used in bearer mode:
    accessToken: '' as string,
    refreshToken: '' as string,

    loading: false,
    authErrors: [] as string[],
    initialized: false as boolean
  }),

  getters: {
    isAuthenticated: s => !!s.user,
    isLoggedIn: s => !!s.user,
    token: s => {
      // Check cookie first (for cookie-bearer hybrid mode)
      if (import.meta.client) {
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1]
        if (authCookie) return authCookie
      }
      // Fall back to bearer mode
      return s.mode === 'bearer' ? s.accessToken : ''
    },
  },

  actions: {
    // Initialize auth from cookie or localStorage
    async initAuth() {
      // Prevent multiple simultaneous initialization calls
      if (this.initialized) {
        return
      }

      if (import.meta.client) {
        // Use useCookie to read the auth token cookie (consistent with how we write it)
        const authCookie = useCookie('auth-token')
        const token = authCookie.value

        // Get saved user from localStorage
        const savedUser = localStorage.getItem('user')

        if (token && savedUser) {
          // Cookie exists and we have user data - restore immediately for fast UI
          try {
            this.user = JSON.parse(savedUser)
            this.initialized = true
            
            // Validate token in background without blocking initialization
            // This ensures session persists even if validation fails temporarily
            this.me().catch(() => {
              // Only clear if token is truly invalid (handled by API plugin 401 handler)
              // Don't clear here to avoid logout on network errors
            })
          } catch {
            // If parsing fails, try to fetch from backend
            try {
              await this.me()
              this.initialized = true
            } catch {
              // If me() also fails, clear everything
              this.clear()
              this.initialized = true
            }
          }
        } else if (token) {
          // Cookie exists but no saved user - fetch from backend
          try {
            await this.me()
            this.initialized = true
          } catch {
            // If me() fails, clear the invalid cookie
            this.clear()
            this.initialized = true
          }
        } else if (this.mode === 'bearer') {
          // No cookie, try bearer mode with localStorage
          const savedAccessToken = localStorage.getItem('accessToken')
          const savedRefreshToken = localStorage.getItem('refreshToken')

          if (savedAccessToken && savedUser) {
            this.accessToken = savedAccessToken
            this.refreshToken = savedRefreshToken || ''
            try {
              this.user = JSON.parse(savedUser)
              this.initialized = true
              
              // Validate token in background
              this.me().catch(() => {
                // Token validation failed, but don't clear immediately
                // Let API plugin handle 401 errors
              })
            } catch {
              // Clear invalid data
              this.clear()
              this.initialized = true
            }
          } else {
            // No bearer tokens found - only mark as initialized on client
            if (import.meta.client) {
              this.initialized = true
            }
          }
        } else {
          // No token or user found - only mark as initialized on client
          // On server, we don't have access to localStorage/cookies, so don't mark as initialized
          if (import.meta.client) {
            this.initialized = true
          }
        }
      } else {
        // Server side - don't mark as initialized since we can't access localStorage/cookies
        // This will allow client-side initialization to run
        // Only mark as initialized if we're in bearer mode and have tokens in state
        if (this.mode === 'bearer' && this.accessToken && this.user) {
          this.initialized = true
        }
      }
    },

    // ---------- Login: Backend returns token which we store in cookie ----------
    async login(payload: LoginDto) {
      const nuxtApp = useNuxtApp()
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase
      
      this.loading = true
      this.authErrors = []
      try {
        const { remember, ...credentials } = payload
        // Call login endpoint - backend should return access token
        const hasApiPlugin = '$api' in nuxtApp && typeof nuxtApp.$api === 'function'
        const url = hasApiPlugin ? '/api/token/' : `${baseURL}/api/token/`
        const options = hasApiPlugin 
          ? { method: 'POST' as const, body: credentials }
          : { method: 'POST' as const, body: credentials, credentials: 'include' as const, headers: { 'Content-Type': 'application/json' } }
        
        const apiCall = hasApiPlugin ? nuxtApp.$api : $fetch
        const res = await (apiCall as typeof $fetch)<{
          access: string,
          refresh?: string,
          user?: User
        }>(url, options)

        // Store token in cookie (client-side cookie, not httpOnly)
        if (import.meta.client && res.access) {
          const authCookie = useCookie('auth-token', {
            maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          })
          authCookie.value = res.access

          // Store refresh token if provided
          if (res.refresh) {
            this.refreshToken = res.refresh
            localStorage.setItem('refreshToken', res.refresh)
          }

          // If user is included in response, use it
          if (res.user) {
            this.user = res.user
            localStorage.setItem('user', JSON.stringify(res.user))
            this.initialized = true
          } else {
            // Otherwise fetch user data
            await this.me()
            this.initialized = true
          }
        }

        return { success: true }
      } catch (error: unknown) {
        const fallback = 'Login failed'
        let message = fallback
        if (typeof error === 'object' && error !== null && 'data' in error) {
          const data = (error as { data?: { message?: unknown } }).data
          if (data && typeof data.message === 'string') {
            message = data.message
          }
        }
        if (import.meta.dev) {
          console.error('[auth] login failed:', message, error)
        }
        this.authErrors = [message]
        return { success: false, error: message }
      } finally {
        this.loading = false
      }
    },

    async register(payload: RegisterDto) {
      const nuxtApp = useNuxtApp()
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase
      
      this.loading = true
      this.authErrors = []
      try {
        const hasApiPlugin = '$api' in nuxtApp && typeof nuxtApp.$api === 'function'
        const url = hasApiPlugin ? '/api/users/register/' : `${baseURL}/api/users/register/`
        const options = hasApiPlugin
          ? { method: 'POST' as const, body: payload }
          : { method: 'POST' as const, body: payload, credentials: 'include' as const, headers: { 'Content-Type': 'application/json' } }
        
        const apiCall = hasApiPlugin ? nuxtApp.$api : $fetch
        await (apiCall as typeof $fetch)(url, options)
        // Option A: auto-login after register
        await this.login({ email: payload.email, password: payload.password })
        return { success: true }
      } catch (error: unknown) {
        const fallback = 'Registration failed'
        let message = fallback
        if (typeof error === 'object' && error !== null && 'data' in error) {
          const data = (error as { data?: { message?: unknown } }).data
          if (data && typeof data.message === 'string') {
            message = data.message
          }
        }
        if (import.meta.dev) {
          console.error('[auth] register failed:', message, error)
        }
        this.authErrors = [message]
        return { success: false, error: message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const nuxtApp = useNuxtApp()
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase
      try {
        const hasApiPlugin = '$api' in nuxtApp && typeof nuxtApp.$api === 'function'
        const url = hasApiPlugin ? '/auth/logout' : `${baseURL}/auth/logout`
        const options = hasApiPlugin
          ? { method: 'POST' as const }
          : { method: 'POST' as const, credentials: 'include' as const, headers: { 'Content-Type': 'application/json' } }
        
        const apiCall = hasApiPlugin ? nuxtApp.$api : $fetch
        await (apiCall as typeof $fetch)(url, options)
      } catch {
        // ignore
      }
      this.clear()
    },

    async me() {
      const nuxtApp = useNuxtApp()
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase
      try {
        const hasApiPlugin = '$api' in nuxtApp && typeof nuxtApp.$api === 'function'
        const url = hasApiPlugin ? '/api/users/me/' : `${baseURL}/api/users/me/`
        const token = this.token
        const options = hasApiPlugin
          ? { 
              method: 'GET' as const,
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              }
            }
          : { 
              method: 'GET' as const, 
              credentials: 'include' as const, 
              headers: { 
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              } 
            }
        
        const apiCall = hasApiPlugin ? nuxtApp.$api : $fetch
        const user = await (apiCall as typeof $fetch)<User>(url, options)
        this.user = user
        this.initialized = true
        
        // Persist user to localStorage
        if (import.meta.client) {
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (error: any) {
        // Only clear user if we get a 401 (unauthorized) - token is invalid
        // Don't clear on network errors or other issues
        if (error?.status === 401 || error?.response?.status === 401) {
          this.user = null
          // Clear stale data
          if (import.meta.client) {
            localStorage.removeItem('user')
          }
        }
        // Re-throw error so caller can handle it
        throw error
      }
    },

    async refreshTokenFlow() {
      const nuxtApp = useNuxtApp()
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase
      if (this.mode !== 'bearer') return
      if (!this.refreshToken) throw new Error('No refresh token')
      
      const hasApiPlugin = '$api' in nuxtApp && typeof nuxtApp.$api === 'function'
      const url = hasApiPlugin ? '/auth/refresh' : `${baseURL}/auth/refresh`
      const options = hasApiPlugin
        ? { method: 'POST' as const, body: { refreshToken: this.refreshToken } }
        : { method: 'POST' as const, body: { refreshToken: this.refreshToken }, credentials: 'include' as const, headers: { 'Content-Type': 'application/json' } }
      
      const apiCall = hasApiPlugin ? nuxtApp.$api : $fetch
      const res = await (apiCall as typeof $fetch)<{
        accessToken: string,
        refreshToken?: string
      }>(url, options)
      this.accessToken = res.accessToken
      if (res.refreshToken) this.refreshToken = res.refreshToken

      // Update localStorage
      if (import.meta.client) {
        localStorage.setItem('accessToken', res.accessToken)
        if (res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken)
        }
      }
    },

    clear() {
      this.user = null
      this.accessToken = ''
      this.refreshToken = ''
      this.authErrors = []
      this.initialized = false // Reset so auth can be re-initialized if needed

      // Clear cookie and localStorage
      if (import.meta.client) {
        // Remove auth token cookie
        const authCookie = useCookie('auth-token')
        authCookie.value = null

        // Clear localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
  },
})
