<template>
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Purchase Points</h3>
      
      <!-- Purchase Options -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          v-for="option in purchaseOptions"
          :key="option.points"
          @click="selectedOption = option"
          :class="[
            'p-4 border-2 rounded-lg text-center transition-colors',
            selectedOption?.points === option.points
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="text-2xl font-bold text-blue-600">{{ option.points.toLocaleString() }}</div>
          <div class="text-sm text-gray-600">points</div>
          <div class="text-lg font-semibold mt-2">${{ option.amount }}</div>
        </button>
      </div>

      <!-- Selected Option Summary -->
      <div v-if="selectedOption" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex justify-between items-center">
          <span class="font-medium">Selected: {{ selectedOption.points.toLocaleString() }} points</span>
          <span class="text-xl font-bold text-blue-600">${{ selectedOption.amount }}</span>
        </div>
      </div>

      <!-- Pay Button -->
      <UButton 
        @click="handlePayment"
        :loading="loading" 
        :disabled="!selectedOption"
        color="primary" 
        size="lg"
        block
      >
        {{ loading ? "Processing..." : `Pay $${selectedOption?.amount || '0'}` }}
      </UButton>
      
      <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
      <p v-if="success" class="mt-4 text-green-600">{{ success }}</p>
    </div>
  </template>

<script setup lang="ts">
import { ref } from 'vue'

interface PurchaseOption {
  points: number
  amount: string
  description: string
}

const config = useRuntimeConfig()
const loading = ref(false)
const error = ref('')
const success = ref('')
const selectedOption = ref<PurchaseOption | null>(null)

// Purchase options
const purchaseOptions: PurchaseOption[] = [
  { points: 1000, amount: '10.00', description: 'Purchase 1000 points' },
  { points: 5000, amount: '45.00', description: 'Purchase 5000 points' },
  { points: 10000, amount: '80.00', description: 'Purchase 10000 points' }
]

// Set default selection
selectedOption.value = purchaseOptions[0] || null

const handlePayment = async () => {
  if (!selectedOption.value) {
    error.value = 'Please select a purchase option'
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true

  try {
    // Step 1: Request backend to create checkout session
    const authStore = useAuthStore()
    const token = authStore.token
    
    const checkoutResponse = await $fetch(`${config.public.apiBase}/api/payments/create-checkout-session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: {
        amount: selectedOption.value.amount,
        payment_type: 'points_purchase',
        description: selectedOption.value.description,
        points_amount: selectedOption.value.points
      }
    }) as any

    if (checkoutResponse.error) {
      error.value = checkoutResponse.error
      loading.value = false
      return
    }

    // Step 2: Redirect to Stripe Checkout page
    if (checkoutResponse.url) {
      window.location.href = checkoutResponse.url
    } else {
      error.value = 'Failed to create checkout session'
      loading.value = false
    }

  } catch (fetchError: any) {
    error.value = fetchError.data?.message || 'Payment failed. Please try again.'
    loading.value = false
  }
}
</script>
