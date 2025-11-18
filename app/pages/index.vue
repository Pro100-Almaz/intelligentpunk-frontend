<script setup lang="ts">
import { ref, shallowRef, onMounted, computed, reactive } from 'vue'
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period, Range } from '~/types'
import { useDashboard } from '~/composables/useDashboard'
import {Pagination} from "swiper/modules";
import SectionTitle from "~/components/marketplace/SectionTitle.vue";
import {Swiper, SwiperSlide} from "swiper/vue";
import ToolCard from "~/components/marketplace/ToolCard.vue";

const user = useAuthStore()
const router = useRouter()


definePageMeta({
  layout: 'default',
  middleware: 'auth',
  requiresAuth: true,
})

const { isNotificationsSlideoverOpen, getBalance, balanceData } = useDashboard()

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
    const data = await $fetch<{ balance: string | number }>(`${config.public.apiBase}/api/balance/`, {
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

onMounted(async () => {
  // Ensure auth is initialized before making API calls
  if (import.meta.client && !auth.initialized) {
    await auth.initAuth()
  }
  
  // Only make API calls if user is authenticated
  if (auth.isLoggedIn) {
    fetchPointsFromBackend()
    fetchSubscription()
    getBalance()
  }
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

const projectMenuItems = [
  [{
    label: 'Edit Project',
    icon: 'i-heroicons-pencil',
    click: () => console.log('Edit project')
  }, {
    label: 'Duplicate',
    icon: 'i-heroicons-document-duplicate',
    click: () => console.log('Duplicate project')
  }, {
    label: 'Share',
    icon: 'i-heroicons-share',
    click: () => console.log('Share project')
  }], [{
    label: 'Archive',
    icon: 'i-heroicons-archive-box',
    click: () => console.log('Archive project')
  }, {
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: () => console.log('Delete project')
  }]
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
      <div class="space-y-6 p-6">
        <!-- Top Cards Row -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- Welcome Card -->
          <UCard class="md:col-span-4 overflow-hidden rounded-xl h-full bg-white dark:bg-gray-900">
            <div class="px-6 py-4 flex items-center space-x-4">
              <UAvatar 
                :src="user.user?.avatar || undefined"
                :alt="user.user?.name || user.user?.username || 'User'"
                size="3xl"
              />
              <div>
                <div class="text-gray-500 text-sm">Welcome back,</div>
                <div class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ user.user?.name || user.user?.username || 'User' }}
                </div>
              </div>
            </div>
            <div class="px-6 py-5 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center text-red-500 mb-2">
                <UIcon name="i-lucide-brain" class="size-5 mr-2" />
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tip of the Day</span>
              </div>
              <p class="text-gray-900 dark:text-white">
                "{{ tipOfTheDay.text }}"
              </p>
            </div>
          </UCard>

          <!-- Points Balance Card -->
          <UCard class="md:col-span-3 h-full flex flex-col">
            <div class="flex-1">
              <div class="text-gray-500 mb-1 text-sm">Points Balance</div>
              <div class="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {{ pointsData.total.toLocaleString() }}
              </div>
              <div class="text-sm text-red-500 mb-6">
                {{ pointsData.expiring.amount }} pts expiring in {{ pointsData.expiring.days }} days
              </div>
            </div>
            <div class="mt-auto pt-4 pb-6">
              <UButton 
                color="success" 
                @click="router.push('/subscription')"
              >
                Buy More Points
              </UButton>
            </div>
          </UCard>

          <!-- Subscription Card -->
          <UCard class="md:col-span-5 bg-white dark:bg-gray-900 rounded-xl">
            <div class="flex items-center">
              <div class="flex-1 pr-4">
                <div class="text-gray-500 text-sm">Subscription status</div>
                <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {{ subscriptionData.type }}
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center">
                    <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span class="text-gray-600 dark:text-gray-400 text-sm">
                      {{ subscriptionData.daysCompleted }} days trail complete
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></span>
                    <span class="text-gray-600 dark:text-gray-400 text-sm">
                      {{ subscriptionData.daysLeft }} days trail left
                    </span>
                  </div>
                  <div class="mt-6">
                    <UButton
                      variant="link"
                      color="neutral"
                      class="px-0 hover:underline"
                      trailing-icon="i-lucide-arrow-right"
                    >
                      Renew now
                    </UButton>
                  </div>
                </div>
              </div>

              <div class="flex-shrink-0">
                <div class="relative w-36 h-36">
                  <svg viewBox="0 0 100 100" class="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#86efac"
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-dasharray="282.7"
                      :stroke-dashoffset="282.7 * (1 - subscriptionData.progress / 100)"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="text-2xl font-bold text-red-500">
                      {{ subscriptionData.progress }}%
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- AI Models Carousel -->
        <div class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide">
          <UCard
            v-for="item in aiModels"
            :key="item.id"
            class="relative overflow-hidden max-w-[200px] min-w-[200px] flex-shrink-0 snap-center flex flex-col"
          >
            <div v-if="item.discount" class="absolute top-0 left-0 bg-rose-500 text-white text-xs px-2 py-1 rounded-br-md z-10">
              {{ item.discount }}
            </div>

            <div class="flex flex-col items-center h-full py-4 flex-1">
              <div class="mb-2">
                <UAvatar :src="item.icon" :alt="`${item.name} logo`" size="lg" />
              </div>
              <h3 class="text-lg font-bold mb-1 text-gray-900 dark:text-white">{{ item.name }}</h3>
              <p class="text-sm text-gray-500 text-center mb-4 px-2 flex-1">{{ item.description }}</p>

              <div class="mt-auto">
                <UButton 
                  size="sm" 
                  :color="item.discount ? 'success' : 'neutral'"
                  :variant="item.discount ? 'solid' : 'outline'"
                >
                  Try Now
                </UButton>
              </div>
            </div>
          </UCard>
        </div>



        <!-- Usage Overview Section -->
        <div class="flex flex-col md:flex-row gap-6">
          <UCard class="flex-1">
            <h2 class="text-xl font-medium mb-6">Usage Overview</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-1 flex flex-col justify-between">
                <div class="mb-6">
                  <div class="flex items-center mb-4">
                    <UAvatar :src="usageData.tool.icon" :alt="`${usageData.tool.name} logo`" size="md" class="mr-3" />
                    <div>
                      <h3 class="font-bold text-lg">{{ usageData.tool.name }}</h3>
                      <p class="text-sm text-gray-400">{{ usageData.tool.description }}</p>
                    </div>
                  </div>

                  <div class="mb-6">
                    <div class="text-gray-500 text-sm">Points used</div>
                    <div class="text-3xl font-bold">{{ usageData.pointsUsed.toLocaleString() }}</div>
                  </div>
                </div>

                <div class="space-y-3">
                  <div>
                    <div class="text-sm text-gray-500">Total Used:</div>
                    <div class="font-bold">{{ usageData.totalUsed }} pts</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">Tools Used:</div>
                    <div class="font-bold">{{ usageData.toolsUsed }}</div>
                  </div>
                </div>
              </div>

              <div class="md:col-span-2">
                <div class="text-center text-gray-400 py-20">
                  Chart visualization area
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="w-full md:w-80">
            <div class="space-y-4">
              <div v-for="tool in aiToolsUsage" :key="tool.id" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <UAvatar :src="tool.icon" :alt="`${tool.name} logo`" size="sm" class="mr-3" />
                    <div>
                      <h3 class="font-bold">{{ tool.name }}</h3>
                      <p class="text-xs text-gray-500">{{ tool.description }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold">{{ tool.pointsUsed }}</div>
                    <div class="text-xs text-gray-500">pts Used</div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Bottom Section -->
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <!-- Suggested AI -->
          <div class="lg:col-span-3">
            <UCard class="h-full">
              <h2 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Suggested AI based on your chat history</h2>

              <div class="space-y-4">
                <UCard v-for="item in suggestedAi" :key="item.id" class="bg-gray-50 dark:bg-gray-800">
                  <div class="grid grid-cols-6 gap-4 items-center">
                    <div class="col-span-1 flex justify-center">
                      <UAvatar :src="item.icon" :alt="`${item.name} logo`" size="3xl" />
                    </div>

                    <div class="col-span-3 flex flex-col space-y-2">
                      <h3 class="font-bold text-sm">{{ item.name }}</h3>
                      <p class="text-xs text-gray-500">{{ item.description }}</p>
                      <UButton size="sm" class="w-fit">
                        Try Now
                      </UButton>
                    </div>

                    <div class="col-span-2 text-right">
                      <div class="font-bold text-lg">{{ item.points.toLocaleString() }}</div>
                      <div class="text-xs text-gray-500">pts</div>
                    </div>
                  </div>
                </UCard>
              </div>
            </UCard>
          </div>

          <!-- Right Side -->
          <div class="lg:col-span-4">
            <!-- Quick Access -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <UCard
                v-for="item in quickAccess"
                :key="item.id"
                class="h-full"
                :style="{ backgroundColor: item.color }"
              >
                <div class="flex flex-col items-center justify-center py-4">
                  <UIcon :name="item.icon" class="text-4xl mb-2" />
                  <div class="font-medium">{{ item.name }}</div>
                </div>
              </UCard>
            </div>

            <!-- Recent Activity & Latest Projects -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Recent Activity -->
              <UCard class="h-full">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-medium text-gray-600 dark:text-gray-400">Recent Activity</h2>
                </div>

                <div class="space-y-4">
                  <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                    <div class="flex items-center">
                      <UAvatar :src="activity.icon" size="sm" class="mr-3" />
                      <div>
                        <div class="font-medium">{{ activity.type }}</div>
                        <div class="text-xs text-gray-500">{{ activity.time }}</div>
                      </div>
                    </div>
                    <div class="text-sm text-gray-500">{{ activity.timeAgo }}</div>
                  </div>
                </div>
              </UCard>

              <!-- Latest Projects -->
              <UCard>
                <div class="mb-3 flex justify-between items-center">
                  <h2 class="text-xl font-medium text-gray-400">Latest Usage</h2>
                  <button class="text-black dark:text-white text-sm font-medium underline hover:no-underline">
                    View all
                  </button>
                </div>

                <div v-for="project in latestProjects" :key="project.id" class="bg-white dark:bg-gray-900 rounded-lg p-2 mb-2 last:mb-0 w-full">
                  <div class="grid grid-cols-6 gap-2 items-center">
                    <div class="col-span-1 flex justify-center">
                      <UAvatar :src="project.icon" size="lg" />
                    </div>

                    <div class="col-span-4 flex flex-col space-y-1">
                      <div class="font-bold text-sm">{{ project.title }}</div>
                      <div class="text-xs text-gray-500">{{ project.time }}</div>
                      <UButton class="w-fit text-xs">
                        Go to studio
                      </UButton>
                    </div>

                    <div class="col-span-1 flex justify-end">
                      <UDropdownMenu :items="projectMenuItems">
                        <UButton color="neutral" variant="ghost" size="sm" square>
                          <UIcon name="i-heroicons-ellipsis-vertical" class="size-4" />
                        </UButton>
                      </UDropdownMenu>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
