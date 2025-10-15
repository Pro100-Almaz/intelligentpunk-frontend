<script setup lang="ts">
import { ref, shallowRef, onMounted, computed, reactive } from 'vue'
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period, Range } from '~/types'
import { useDashboard } from '~/composables/useDashboard'
import HomeStats from '~/components/dashboard/HomeStats.vue'
import HomeChart from '~/components/dashboard/HomeChart.vue'
import HomeSales from '~/components/dashboard/HomeSales.vue'
import WelcomeCard from '~/components/dashboard/WelcomeCard.vue'
import PointsBalanceCard from '~/components/dashboard/PointsBalanceCard.vue'
import SubscriptionCard from '~/components/dashboard/SubscriptionCard.vue'
import AiModelCard from '~/components/dashboard/AiModelCard.vue'
import UsageOverviewCard from '~/components/dashboard/UsageOverviewCard.vue'
import AiToolsUsageCard from '~/components/dashboard/AiToolsUsageCard.vue'
import SuggestedAiCard from '~/components/dashboard/SuggestedAiCard.vue'
import QuickAccessCard from '~/components/dashboard/QuickAccessCard.vue'
import RecentActivityCard from '~/components/dashboard/RecentActivityCard.vue'
import LatestProjectsCard from '~/components/dashboard/LatestProjectsCard.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  requiresAuth: true,
})

const { isNotificationsSlideoverOpen } = useDashboard()

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')

// new state for header
const search = ref('')
const locale = ref<'en'|'es'>('en')

// Your mega‐menu items (example)
const megaMenuItems = [
  { label: 'Products', to: '/products' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
] satisfies DropdownMenuItem[]

// Your profile dropdown
const profileItems = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
  { label: 'Sign out', icon: 'i-lucide-log-out', to: '/logout' }
] satisfies DropdownMenuItem[]

// Mock data
const user = {
  name: 'John',
  avatar: '/placeholder.svg'
}

const tipOfTheDay = {
  icon: '🧠',
  text: 'Use AI Templates to save time and keep a consistent tone.'
}

const pointsData = reactive({
  total: 0,
  expiring: {
    amount: 0,
    days: 0
  }
})

const subscriptionData = reactive({
  type: 'No active subscription',
  progress: 0,
  daysCompleted: 0,
  daysLeft: 0
})

// Backend-powered header points
const headerPoints = ref<number>(0)
const headerPointsLabel = computed(() => Math.round(Number(headerPoints.value || 0)).toLocaleString())

const config = useRuntimeConfig()
const auth = useAuthStore()

async function fetchPointsFromBackend() {
  try {
    const data = await $fetch<{ balance: string | number }>(`${config.public.apiBase}/api/balance/wallet/balance/`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    const raw = typeof data.balance === 'string' ? parseFloat(data.balance) : Number(data.balance)
    const val = isNaN(raw) ? 0 : raw
    headerPoints.value = val
    pointsData.total = Math.round(val)
  } catch {
    // ignore
  }
}

// Subscription card dynamic mapping
function diffDays(a: Date, b: Date) {
  const ms = Math.max(0, a.getTime() - b.getTime())
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

async function fetchSubscription() {
  try {
    const resp = await $fetch<any>(`${config.public.apiBase}/api/payments/subscriptions/`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    const list: any[] = Array.isArray(resp) ? resp : (resp?.results || [])
    const active = list.find(s => ['active', 'trialing', 'past_due'].includes(s.status))
    if (!active) {
      subscriptionData.type = 'No active subscription'
      subscriptionData.progress = 0
      subscriptionData.daysCompleted = 0
      subscriptionData.daysLeft = 0
      return
    }
    // Map price to plan label
    const starterId = (config.public as any).stripePriceStarter as string | undefined
    const enterpriseId = (config.public as any).stripePriceEnterprise as string | undefined
    if (active.price_id && active.price_id === starterId) subscriptionData.type = 'Starter'
    else if (active.price_id && active.price_id === enterpriseId) subscriptionData.type = 'Enterprise'
    else subscriptionData.type = 'Pro'

    const now = new Date()
    const start = active.current_period_start ? new Date(active.current_period_start) : now
    const end = active.current_period_end ? new Date(active.current_period_end) : now
    const totalMs = Math.max(1, end.getTime() - start.getTime())
    const elapsedMs = Math.min(Math.max(0, now.getTime() - start.getTime()), totalMs)
    subscriptionData.progress = Math.round((elapsedMs / totalMs) * 100)
    subscriptionData.daysCompleted = diffDays(now, start)
    subscriptionData.daysLeft = diffDays(end, now)
  } catch {
    // ignore
  }
}

onMounted(() => {
  fetchPointsFromBackend()
  fetchSubscription()
})

const aiModels = [
  {
    id: 1,
    name: 'ChatGPT',
    icon: '/placeholder.svg',
    description: 'a conversational AI chatbot developed by OpenAI',
    discount: '20% Off',
    color: 'emerald'
  },
  {
    id: 2,
    name: 'Deepseek',
    icon: '/placeholder.svg',
    description: 'a conversational AI chatbot developed by OpenAI',
    color: 'blue'
  },
  {
    id: 3,
    name: 'Gemini',
    icon: '/placeholder.svg',
    description: 'Reasoning across text, code, images, and more.',
    color: 'indigo'
  },
  {
    id: 4,
    name: 'Claude',
    icon: '/placeholder.svg',
    description: 'a conversational AI chatbot developed by OpenAI',
    color: 'orange'
  },
  {
    id: 5,
    name: 'Copilot',
    icon: '/placeholder.svg',
    description: 'a conversational AI chatbot developed by OpenAI',
    color: 'purple'
  },
  {
    id: 6,
    name: 'Midjourney',
    icon: '/placeholder.svg',
    description: 'a conversational AI chatbot developed by OpenAI',
    color: 'gray'
  }
]

const usageData = {
  tool: {
    name: 'Typli.io',
    icon: '/placeholder.svg',
    description: 'AI text generator'
  },
  pointsUsed: 2345,
  totalUsed: 4000,
  toolsUsed: 8,
  chartData: [50, 70, 90, 120, 300, 250, 200, 180, 220, 280, 250, 220]
}

const aiToolsUsage = [
  {
    id: 1,
    name: 'Typli.io',
    icon: '/placeholder.svg',
    description: 'AI text generator',
    pointsUsed: 204
  },
  {
    id: 2,
    name: 'Replika',
    icon: '/placeholder.svg',
    description: 'AI text generator',
    pointsUsed: 204
  },
  {
    id: 3,
    name: 'Perplexity AI',
    icon: '/placeholder.svg',
    description: 'AI text generator',
    pointsUsed: 204
  },
  {
    id: 4,
    name: 'Ideogram',
    icon: '/placeholder.svg',
    description: 'AI text generator',
    pointsUsed: 204
  }
]

const suggestedAi = [
  {
    id: 1,
    name: 'Voila',
    icon: '/placeholder.svg',
    description: 'Create high-quality content with our free AI text generator',
    points: 2204
  },
  {
    id: 2,
    name: 'Mistral',
    icon: '/placeholder.svg',
    description: 'Create high-quality content with our free AI text generator',
    points: 2204
  },
  {
    id: 3,
    name: 'Wit.ai',
    icon: '/placeholder.svg',
    description: 'Create high-quality content with our free AI text generator',
    points: 2204
  }
]

const quickAccess = [
  {
    id: 1,
    name: 'Marketplace',
    icon: 'i-heroicons-computer-desktop',
    color: '#FFC9C9'
  },
  {
    id: 2,
    name: 'My Studio',
    icon: 'i-heroicons-photo',
    color: '#FFD6A8'
  },
  {
    id: 3,
    name: 'My Usage',
    icon: 'i-heroicons-chart-bar',
    color: '#D8F999'
  },
  {
    id: 4,
    name: 'Library',
    icon: 'i-heroicons-book-open',
    color: '#96F7E4'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'Used AI Text Writer',
    icon: '/placeholder.svg',
    time: '1 hour ago',
    timeAgo: '12 min'
  },
  {
    id: 2,
    type: 'Submitted feedback',
    icon: '/placeholder.svg',
    time: '1 hour ago',
    timeAgo: '23 min'
  },
  {
    id: 3,
    type: 'Generated 3 images',
    icon: '/placeholder.svg',
    time: '1 hour ago',
    timeAgo: '34 min'
  },
  {
    id: 4,
    type: 'Used AI Text Writer',
    icon: '/placeholder.svg',
    time: '1 hour ago',
    timeAgo: '1 h'
  },
  {
    id: 5,
    type: 'Used AI Text Writer',
    icon: '/placeholder.svg',
    time: '1 hour ago',
    timeAgo: '45 min'
  }
]

const latestProjects = [
  {
    id: 1,
    title: 'AI video editing',
    icon: '/placeholder.svg',
    time: '1 hour ago'
  },
  {
    id: 2,
    title: 'AI video editing',
    icon: '/placeholder.svg',
    time: '1 hour ago'
  },
  {
    id: 3,
    title: 'AI video editing',
    icon: '/placeholder.svg',
    time: '1 hour ago'
  }
]

</script>

<template>
  <UDashboardPanel id="home" class="p-0 dark:bg-gray-800">
    <template #header>
      <UDashboardNavbar class="bg-gray-50 dark:bg-gray-900">
        <!-- left side -->
        <template #leading>
          <div class="flex items-center space-x-4">
            <!-- search input -->
            <UInput
              v-model="search"
              placeholder="Search here…"
              size="md"
              clearable
              icon="i-lucide-search"
              class="min-w-[220px]"
            />

            <!-- mega-menu dropdown -->
            <UDropdownMenu
              label="Mega menu"
              :items="megaMenuItems"
              size="md"
              variant="outline"
            />
          </div>
        </template>

        <!-- right side -->
        <template #right>
          <div class="flex items-center space-x-3">
            <!-- Points Display -->
            <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 border">
              <UIcon name="i-lucide-coins" class="size-4 text-yellow-600 mr-2" />
              <div class="text-sm">
                <span class="font-bold text-gray-900">{{ pointsData.total.toLocaleString() }}</span>
                <span class="text-gray-500 ml-1">pts</span>
              </div>
            </div>

            <!-- language switcher -->
            <UTooltip text="Switch language">
              <UButton
                variant="ghost"
                square
                @click="locale = locale === 'en' ? 'es' : 'en'"
              >
                <UIcon
                  :name="locale === 'en' ? 'i-twemoji-flag-united-kingdom' : 'i-twemoji-flag-spain'"
                  class="size-5"
                />
              </UButton>
            </UTooltip>

            <!-- scan/QR button -->
            <UTooltip text="Scan">
              <UButton variant="ghost" square icon="i-lucide-image-plus" />
            </UTooltip>

            <!-- notifications -->
            <UTooltip text="Notifications (N)">
              <UButton
                variant="ghost"
                square
                @click="isNotificationsSlideoverOpen = true"
              >
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5" />
                </UChip>
              </UButton>
            </UTooltip>

            <!-- profile dropdown -->
            <!-- <UDropdownMenu :items="profileItems" trigger="hover">
              <div class="flex items-center cursor-pointer">
                <UAvatar
                  size="sm"
                  src="https://i.pravatar.cc/40?img=3"
                />
                <span class="ml-2 text-sm font-medium">admin</span>
                <UIcon name="i-lucide-chevron-down" class="size-4 ml-1" />
              </div>
            </UDropdownMenu> -->

            <!-- settings -->
            <!-- <UTooltip text="Settings">
              <UButton variant="ghost" square icon="i-lucide-settings" />
            </UTooltip> -->
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-7xl mx-auto space-y-6 p-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <WelcomeCard
            class="md:col-span-4 bg-white dark:bg-gray-900"
            :user="user"
            :tip="tipOfTheDay"
          />

          <PointsBalanceCard
            class="md:col-span-3"
            :points="pointsData"
          />

          <SubscriptionCard
            class="md:col-span-5"
            :subscription="subscriptionData"
          />
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AiModelCard 
            v-for="model in aiModels" 
            :key="model.id" 
            :model="model" 
          />
        </div>
        
        <div class="grid grid-cols-1 gap-6">
          <UsageOverviewCard
            :usage="{
              tool: { icon: '...', name: 'Typli.io', description: 'Ai text generator' },
              pointsUsed: 2345,
              chartData: [120, 180, 90, 250, 400, 200, 350, 150],
              totalUsed: 4000,
              toolsUsed: 8
            }"
            :tools="[
              { id: 1, icon: '...', name: 'Typli.io', description: 'Ai text generator', pointsUsed: 204 },
              { id: 2, icon: '...', name: 'Replika', description: 'Ai text generator', pointsUsed: 204 },
              // etc
            ]"
          />
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div class="lg:col-span-3">
            <SuggestedAiCard :suggestions="suggestedAi" />
          </div>
          <div class="lg:col-span-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <QuickAccessCard 
                v-for="item in quickAccess" 
                :key="item.id" 
                :item="item" 
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecentActivityCard :activities="recentActivities" />
              <LatestProjectsCard :projects="latestProjects" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
