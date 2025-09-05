<template>
  <UDashboardPanel id="subscription">
    <template #header>
      <UDashboardNavbar class="bg-gray-50">
        <template #left>
          <h1 class="text-2xl font-bold">Subscription & Billing</h1>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-7xl mx-auto p-6">
        <!-- Tab Navigation -->
        <div class="mb-6">
          <nav class="flex border-b border-gray-200">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-48 py-3 px-4 border-b-2 font-medium text-sm transition-colors text-center',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <UIcon :name="tab.icon" class="size-4 mr-2 inline" />
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="space-y-6">
          <!-- Buy Points Tab -->
          <div v-show="activeTab === 'buy-points'">
            <StripeCardForm />
          </div>

          <!-- Subscription Plans Tab -->
          <div v-show="activeTab === 'plans'" class="space-y-6">
            <!-- Current Plan -->
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4">Current Plan</h2>
              <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div>
                  <h3 class="text-lg font-medium text-blue-900">{{ currentPlanTitle }}</h3>
                  <p class="text-sm text-blue-700" v-if="currentPlanTitle !== 'No active subscription'">{{ currentPlanPoints }}</p>
                  <p class="text-xs text-blue-600" v-if="renewalDate">Renews on {{ renewalDate }}</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-blue-900">{{ currentPlanPrice }}</p>
                  <UButton variant="outline" size="sm" class="mt-2" :disabled="currentPlanTitle === 'No active subscription'">
                    Manage Plan
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Available Plans -->
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-6">Available Plans</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Starter Plan -->
                <div class="rounded-lg p-6 border border-gray-200 flex flex-col h-full">
                  <h3 class="text-lg font-medium mb-2">Starter</h3>
                  <p class="text-3xl font-bold mb-4">$9<span class="text-sm font-normal text-gray-600">/month</span></p>
                  <ul class="space-y-2 mb-6">
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      10,000 points per month
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      Basic AI tools
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      Email support
                    </li>
                  </ul>
                  <div class="mt-auto">
                    <UButton
                      :disabled="!starterPriceId"
                      color="success"
                      block
                      @click="() => selectPlan('starter')"
                    >
                      Select
                    </UButton>
                  </div>
                </div>

                <!-- Pro Plan -->
                <div class="rounded-lg p-6 border border-gray-200 flex flex-col h-full">
                  <h3 class="text-lg font-medium mb-2">Pro</h3>
                  <p class="text-3xl font-bold mb-4">$29<span class="text-sm font-normal text-gray-600">/month</span></p>
                  <ul class="space-y-2 mb-6">
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      50,000 points per month
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      All AI tools
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      Priority support
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      Advanced features
                    </li>
                  </ul>
                  <div class="mt-auto">
                    <UButton
                      :disabled="!proPriceId"
                      color="info"
                      block
                      @click="() => selectPlan('pro')"
                    >
                      Select
                    </UButton>
                  </div>
                </div>

                <!-- Enterprise Plan -->
                <div class="rounded-lg p-6 border border-gray-200 flex flex-col h-full">
                  <h3 class="text-lg font-medium mb-2">Enterprise</h3>
                  <p class="text-3xl font-bold mb-4">$99<span class="text-sm font-normal text-gray-600">/month</span></p>
                  <ul class="space-y-2 mb-6">
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      200,000 points per month
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      All AI tools + Beta features
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      24/7 phone support
                    </li>
                    <li class="flex items-center text-sm">
                      <UIcon name="i-lucide-check" class="size-4 text-green-600 mr-2" />
                      Custom integrations
                    </li>
                  </ul>
                  <div class="mt-auto">
                    <UButton
                      :disabled="!enterprisePriceId"
                      color="info"
                      block
                      @click="() => selectPlan('enterprise')"
                    >
                      Select
                    </UButton>
                  </div>
                </div>
              </div>

              <!-- Selected Plan Summary and Action -->
              <div
                v-if="selectedPlanKey"
                class="mt-6 p-4 rounded-lg"
                :class="selectedPlanKey === 'starter' ? 'border border-green-200 bg-green-50' : 'border border-blue-200 bg-blue-50'"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p :class="selectedPlanKey === 'starter' ? 'font-medium text-green-900' : 'font-medium text-blue-900'">
                      Selected: {{ selectedPlanLabel }}
                    </p>
                    <p :class="selectedPlanKey === 'starter' ? 'text-sm text-green-700' : 'text-sm text-blue-700'">
                      {{ selectedPlanPoints }}
                    </p>
                  </div>
                  <UButton :color="selectedPlanKey === 'starter' ? 'success' : 'info'" @click="confirmSelectedPlan" :loading="subscribing">
                    Continue to Checkout
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Tab -->
          <div v-show="activeTab === 'usage'" class="space-y-6">
            <!-- Monthly Usage Overview -->
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4">Monthly Usage</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <p class="text-3xl font-bold text-green-600">32,450</p>
                  <p class="text-sm text-gray-600">Points Used</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-blue-600">17,550</p>
                  <p class="text-sm text-gray-600">Points Remaining</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-gray-600">65%</p>
                  <p class="text-sm text-gray-600">Usage</p>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 65%"></div>
              </div>
            </div>

            <!-- Usage Breakdown -->
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h2 class="text-xl font-semibold mb-4">Usage Breakdown</h2>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center">
                    <UIcon name="i-lucide-brain" class="size-5 text-purple-600 mr-3" />
                    <div>
                      <p class="font-medium">AI Text Generation</p>
                      <p class="text-sm text-gray-600">GPT-4 & Claude</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">15,200 points</p>
                    <p class="text-sm text-gray-600">47% of usage</p>
                  </div>
                </div>
                <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center">
                    <UIcon name="i-lucide-image" class="size-5 text-green-600 mr-3" />
                    <div>
                      <p class="font-medium">Image Generation</p>
                      <p class="text-sm text-gray-600">DALL-E & Midjourney</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">12,800 points</p>
                    <p class="text-sm text-gray-600">39% of usage</p>
                  </div>
                </div>
                <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center">
                    <UIcon name="i-lucide-code" class="size-5 text-blue-600 mr-3" />
                    <div>
                      <p class="font-medium">Code Generation</p>
                      <p class="text-sm text-gray-600">GitHub Copilot</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">4,450 points</p>
                    <p class="text-sm text-gray-600">14% of usage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment History Tab -->
          <div v-show="activeTab === 'history'">
            <PaymentHistory />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StripeCardForm from '~/components/subscription/StripeCardForm.vue'
import PaymentHistory from '~/components/subscription/PaymentHistory.vue'

interface Tab {
  id: string
  name: string
  icon: string
}

const tabs: Tab[] = [
  {
    id: 'buy-points',
    name: 'Buy Points',
    icon: 'i-lucide-coins'
  },
  {
    id: 'plans',
    name: 'Subscription Plans',
    icon: 'i-lucide-crown'
  },
  {
    id: 'usage',
    name: 'Usage',
    icon: 'i-lucide-activity'
  },
  {
    id: 'history',
    name: 'Payment History',
    icon: 'i-lucide-receipt'
  }
]

const activeTab = ref<string>('buy-points')
const toast = useToast()
const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()

const starterPriceId = computed(() => config.public.stripePriceStarter as string | undefined)
const proPriceId = computed(() => config.public.stripePricePro as string | undefined)
const enterprisePriceId = computed(() => config.public.stripePriceEnterprise as string | undefined)

const planToPriceId: Record<'starter' | 'pro' | 'enterprise', () => string | undefined> = {
  starter: () => starterPriceId.value,
  pro: () => proPriceId.value,
  enterprise: () => enterprisePriceId.value
}

async function handleSubscribe(planKey: 'starter' | 'pro' | 'enterprise') {
  try {
    const getter = planToPriceId[planKey]
    const priceId = getter()
    if (!priceId) {
      toast.add({ title: 'Missing price configuration', description: 'Price ID is not configured.' })
      return
    }
    const res = await $fetch<any>(`${config.public.apiBase}/api/payments/create-checkout-session/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: {
        mode: 'subscription',
        price_id: priceId,
        quantity: 1
      }
    })
    if (res?.url) {
      window.location.href = res.url
    } else {
      toast.add({ title: 'Failed to start checkout', description: 'No checkout URL returned.' })
    }
  } catch (err: any) {
    toast.add({ title: 'Checkout error', description: err?.data?.message || 'Unable to start subscription checkout', color: 'error' })
  }
}

// Check for success parameter and show notification
onMounted(() => {
  if (route.query.success === 'true') {
    toast.add({
      title: 'Payment Successful!',
      description: 'Your payment has been processed successfully. Points have been added to your account.',
      icon: 'i-lucide-check-circle',
    })
    
    // Clean up URL by removing the success parameter
    const router = useRouter()
    router.replace({ query: {} })
  }
  fetchCurrentSubscription()
})

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  requiresAuth: true
})

// Dynamic subscription state
const currentPlanKey = ref<'starter' | 'pro' | 'enterprise' | ''>('')
const currentPlanTitle = computed(() => {
  if (currentPlanKey.value === 'starter') return 'Starter Plan'
  if (currentPlanKey.value === 'pro') return 'Pro Plan'
  if (currentPlanKey.value === 'enterprise') return 'Enterprise Plan'
  return 'No active subscription'
})
const currentPlanPrice = computed(() => {
  if (currentPlanKey.value === 'starter') return '$9/month'
  if (currentPlanKey.value === 'pro') return '$29/month'
  if (currentPlanKey.value === 'enterprise') return '$99/month'
  return ''
})
const currentPlanPoints = computed(() => {
  if (currentPlanKey.value === 'starter') return '10,000 points per month'
  if (currentPlanKey.value === 'pro') return '50,000 points per month'
  if (currentPlanKey.value === 'enterprise') return '200,000 points per month'
  return ''
})
const renewalDate = ref<string>('')

async function fetchCurrentSubscription() {
  try {
    const resp = await $fetch<any>(`${config.public.apiBase}/api/payments/subscriptions/`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    const list: any[] = Array.isArray(resp) ? resp : (resp?.results || [])
    const active = list.find(s => ['active', 'trialing', 'past_due'].includes(s.status))
    if (active) {
      // map by price id to plan key
      const priceId: string | undefined = active.price_id
      if (priceId && priceId === starterPriceId.value) currentPlanKey.value = 'starter'
      else if (priceId && priceId === proPriceId.value) currentPlanKey.value = 'pro'
      else if (priceId && priceId === enterprisePriceId.value) currentPlanKey.value = 'enterprise'
      else currentPlanKey.value = ''
      renewalDate.value = active.current_period_end ? new Date(active.current_period_end).toLocaleDateString() : ''
    } else {
      currentPlanKey.value = ''
      renewalDate.value = ''
    }
  } catch (_) {
    currentPlanKey.value = ''
  }
}

// Selection UI state
const selectedPlanKey = ref<'starter' | 'pro' | 'enterprise' | ''>('')
const selectedPlanLabel = computed(() => {
  if (selectedPlanKey.value === 'starter') return 'Starter ($9/month)'
  if (selectedPlanKey.value === 'pro') return 'Pro ($29/month)'
  if (selectedPlanKey.value === 'enterprise') return 'Enterprise ($99/month)'
  return ''
})
const selectedPlanPoints = computed(() => {
  if (selectedPlanKey.value === 'starter') return '10,000 points per month'
  if (selectedPlanKey.value === 'pro') return '50,000 points per month'
  if (selectedPlanKey.value === 'enterprise') return '200,000 points per month'
  return ''
})
const subscribing = ref(false)

function selectPlan(planKey: 'starter' | 'pro' | 'enterprise') {
  selectedPlanKey.value = planKey
}

async function confirmSelectedPlan() {
  if (!selectedPlanKey.value) return
  subscribing.value = true
  try {
    await handleSubscribe(selectedPlanKey.value)
  } finally {
    subscribing.value = false
  }
}
</script> 