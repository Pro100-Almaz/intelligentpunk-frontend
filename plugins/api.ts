import { defineNuxtPlugin, useRuntimeConfig, useCookie } from '#app'
import { useAuthStore } from '~~/stores/auth'

let refreshPromise: Promise<void> | null = null

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const api = $fetch.create({
    baseURL,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },

    // Attach Authorization header for both bearer and cookie modes
    onRequest({ options }) {
      const auth = useAuthStore()
      
      // Bearer mode: use accessToken from store
      if (auth.mode === 'bearer' && auth.accessToken) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${auth.accessToken}`
        }
      }
      
      // Cookie mode: attach token from cookie as Authorization header
      if (auth.mode === 'cookie' && import.meta.client) {
        const authCookie = useCookie('auth-token')
        if (authCookie.value) {
          options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${authCookie.value}`
          }
        }
      }

      if (import.meta.client) {
        const method = (options.method || 'GET').toString().toUpperCase()
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1]

          if (csrfToken) {
            options.headers = {
              ...(options.headers || {}),
              'X-CSRFTOKEN': csrfToken
            }
          }
        }
      }
    },

    // Handle 401 -> try refresh -> retry original once
    async onResponseError(ctx) {
      const { response, options, request } = ctx
      const auth = useAuthStore()

      // avoid infinite loops
      const retried = (options as any)._retried as boolean | undefined
      if (response.status !== 401 || retried) throw response._data ?? response

      // Try server-side refresh (cookie-based) or token refresh (bearer)
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            if (auth.mode === 'cookie') {
              const refreshResponse = await $fetch<{ access?: string }>('/auth/refresh', { 
                baseURL, 
                method: 'POST', 
                credentials: 'include' 
              })
              
              // Update cookie if new token is returned
              if (import.meta.client && refreshResponse.access) {
                const authCookie = useCookie('auth-token', {
                  maxAge: 60 * 60 * 24 * 7, // 7 days
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production'
                })
                authCookie.value = refreshResponse.access
              }
            } else {
              await auth.refreshTokenFlow()
            }
          } finally {
            // Always clear promise so next 401 can try again later
            refreshPromise = null
          }
        })()
      }

      try {
        await refreshPromise
        // retry original request once with a flag
        return await $fetch.raw(request, { ...options, _retried: true })
      } catch (e) {
        // refresh failed -> logout client-side state
        await auth.clear()
        throw e
      }
    }
  })

  return {
    provide: { api }
  }
})
