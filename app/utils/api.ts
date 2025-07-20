export const useApi = () => {
  const config = useRuntimeConfig()
  const authCookie = useCookie('auth-token')
  
  const baseURL = config.public.apiBase || 'http://127.0.0.1:8000'
  
  const fetchWithAuth = async <T>(
    endpoint: string,
    options: {
      method?: string
      body?: any
      headers?: Record<string, string>
    } = {}
  ) => {
    const { method = 'GET', body, headers = {} } = options
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }
    
    // Add authorization header if token exists
    if (authCookie.value) {
      requestHeaders.Authorization = `Bearer ${authCookie.value}`
    }
    
    const { data, error, pending } = await useFetch<T>(`${baseURL}${endpoint}`, {
      method: method as any,
      body,
      headers: requestHeaders
    })
    
    return { data, error, pending }
  }
  
  return {
    get: <T>(endpoint: string, options?: { headers?: Record<string, string> }) =>
      fetchWithAuth<T>(endpoint, { method: 'GET', ...options }),
    
    post: <T>(endpoint: string, body: any, options?: { headers?: Record<string, string> }) =>
      fetchWithAuth<T>(endpoint, { method: 'POST', body, ...options }),
    
    put: <T>(endpoint: string, body: any, options?: { headers?: Record<string, string> }) =>
      fetchWithAuth<T>(endpoint, { method: 'PUT', body, ...options }),
    
    patch: <T>(endpoint: string, body: any, options?: { headers?: Record<string, string> }) =>
      fetchWithAuth<T>(endpoint, { method: 'PATCH', body, ...options }),
    
    delete: <T>(endpoint: string, options?: { headers?: Record<string, string> }) =>
      fetchWithAuth<T>(endpoint, { method: 'DELETE', ...options })
  }
} 