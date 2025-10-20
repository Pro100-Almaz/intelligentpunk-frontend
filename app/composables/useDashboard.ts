import { createSharedComposable } from '@vueuse/core'
import { useRuntimeConfig } from '#app'

const _useDashboard = () => {
  const route = useRoute()
  const router = useRouter()
  const isNotificationsSlideoverOpen = ref(false)
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth-token').value
  const apiBase = config.public.apiBase
  const balanceData = ref<any>(null)
  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-i': () => router.push('/inbox'),
    'g-c': () => router.push('/customers'),
    'g-s': () => router.push('/settings'),
    'n': () => isNotificationsSlideoverOpen.value = !isNotificationsSlideoverOpen.value
  })

  watch(() => route.fullPath, () => {
    isNotificationsSlideoverOpen.value = false
  })
  const getBalance = async () => {
    try {
      const response = await fetch(`${apiBase}/api/balance/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
  
       balanceData.value = await response.json()
    } catch (err: any) {
      console.error('AI API History Error:', err)
    }
  }

  return {
    isNotificationsSlideoverOpen,
    getBalance,
    balanceData
  }
}



export const useDashboard = createSharedComposable(_useDashboard)
