<template>
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-4">Payment History</h2>
    
    <div v-if="loading" class="text-center py-8">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin mx-auto mb-2" />
      <p class="text-gray-600">Loading payment history...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <UIcon name="i-lucide-alert-circle" class="size-6 text-red-600 mx-auto mb-2" />
      <p class="text-red-600">{{ error }}</p>
      <UButton @click="fetchPaymentHistory" variant="outline" size="sm" class="mt-2">
        Try Again
      </UButton>
    </div>

    <div v-else-if="payments.length === 0" class="text-center py-8">
      <UIcon name="i-lucide-credit-card" class="size-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">No payment history yet</p>
      <p class="text-sm text-gray-500">Your payment history will appear here after your first purchase</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
      >
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <UIcon
              :name="getStatusIcon(payment.status)"
              :class="getStatusColor(payment.status)"
              class="size-5"
            />
          </div>
          <div>
            <p class="font-medium">{{ payment.description }}</p>
            <p class="text-sm text-gray-600">
              {{ formatDate(payment.created_at) }}
            </p>
          <div class="flex items-center space-x-2 text-xs text-gray-500">
            <span v-if="payment.payment_method?.brand && payment.payment_method?.last4">
              {{ payment.payment_method.brand.toUpperCase() }} •••• {{ payment.payment_method.last4 }}
            </span>
            <span v-if="payment.points_amount" class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              +{{ payment.points_amount.toLocaleString() }} points
            </span>
          </div>
          </div>
        </div>
        <div class="text-right">
          <p class="font-medium" :class="payment.status === 'succeeded' ? 'text-green-600' : payment.status === 'failed' ? 'text-red-600' : 'text-gray-600'">
            {{ payment.status === 'succeeded' ? '' : payment.status === 'failed' ? '-' : '' }}${{ payment.amount }}
          </p>
          <p class="text-xs text-gray-500 capitalize">{{ payment.status }}</p>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center pt-4">
        <UButton @click="loadMore" :loading="loadingMore" variant="outline" size="sm">
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface PaymentMethod {
  type: string
  last4: string
  brand: string
}

interface Payment {
  id: string
  amount: string
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'requires_action'
  payment_type: string
  points_amount?: number
  description: string
  created_at: string
  payment_method?: PaymentMethod
}

  const payments = ref<Payment[]>([])
  const loading = ref(true)
  const loadingMore = ref(false)
  const error = ref('')
  const hasMore = ref(false)
  const nextUrl = ref<string | null>(null)

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'i-lucide-check-circle'
    case 'failed':
      return 'i-lucide-x-circle'
    case 'pending':
      return 'i-lucide-clock'
    case 'requires_action':
      return 'i-lucide-alert-circle'
    default:
      return 'i-lucide-help-circle'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'text-green-600'
    case 'failed':
      return 'text-red-600'
    case 'pending':
      return 'text-yellow-600'
    case 'requires_action':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchPaymentHistory = async () => {
  try {
    loading.value = true
    error.value = ''

    const config = useRuntimeConfig()
    const auth = useAuthStore()
    const url = `${config.public.apiBase}/api/payments/history/`

    const response = await $fetch<any>(url, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // DRF pagination shape: { count, next, previous, results }
    if (Array.isArray(response)) {
      payments.value = response as Payment[]
      hasMore.value = false
      nextUrl.value = null
    } else {
      payments.value = (response.results || []) as Payment[]
      hasMore.value = !!response.next
      nextUrl.value = response.next || null
    }

  } catch (fetchError: any) {
    error.value = fetchError.data?.detail || fetchError.data?.message || 'Failed to load payment history'
    console.error('Payment history fetch error:', fetchError)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!nextUrl.value) return
  try {
    loadingMore.value = true
    const auth = useAuthStore()
    const response = await $fetch<any>(nextUrl.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    const newItems: Payment[] = (response.results || []) as Payment[]
    payments.value = [...payments.value, ...newItems]
    hasMore.value = !!response.next
    nextUrl.value = response.next || null
  } catch (fetchError: any) {
    error.value = fetchError.data?.detail || fetchError.data?.message || 'Failed to load more payments'
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  fetchPaymentHistory()
})
</script>
