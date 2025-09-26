<template>
  <UDashboardPanel id="marketplace" class="p-0">
    <template #header>
      <UDashboardNavbar class="bg-gray-50">
        <!-- left: search + mega menu -->
        <template #leading>
          <div class="flex items-center space-x-4">
            <UInput v-model="search" placeholder="Search here…" size="md" clearable icon="i-lucide-search"
              class="min-w-[220px]" />
            <UDropdownMenu label="Mega menu" :items="megaMenuItems" size="md" variant="outline" />
          </div>
        </template>

        <!-- right -->
        <template #right>
          <div class="flex items-center space-x-3">
            <!-- Points -->
            <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 border">
              <UIcon name="i-lucide-coins" class="size-4 text-yellow-600 mr-2" />
              <div class="text-sm">
                <span class="font-bold text-gray-900">{{ headerPointsLabel }}</span>
                <span class="text-gray-500 ml-1">pts</span>
              </div>
            </div>
            <!-- language -->
            <UTooltip text="Switch language">
              <UButton variant="ghost" square @click="locale = locale === 'en' ? 'es' : 'en'">
                <UIcon :name="locale === 'en' ? 'i-twemoji-flag-united-kingdom' : 'i-twemoji-flag-spain'"
                  class="size-5" />
              </UButton>
            </UTooltip>
            <!-- scan -->
            <UTooltip text="Scan">
              <UButton variant="ghost" square icon="i-lucide-image-plus" />
            </UTooltip>
            <!-- notifications -->
            <UTooltip text="Notifications (N)">
              <UButton variant="ghost" square @click="isNotificationsSlideoverOpen = true">
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5" />
                </UChip>
              </UButton>
            </UTooltip>
            <!-- profile -->
            <UDropdownMenu :items="profileItems" trigger="hover">
              <div class="flex items-center cursor-pointer">
                <UAvatar size="sm" src="https://i.pravatar.cc/40?img=3" />
                <span class="ml-2 text-sm font-medium">admin</span>
                <UIcon name="i-lucide-chevron-down" class="size-4 ml-1" />
              </div>
            </UDropdownMenu>
            <!-- settings -->
            <UTooltip text="Settings">
              <UButton variant="ghost" square icon="i-lucide-settings" />
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-[68rem] mx-auto space-y-6 p-6">
        <!-- Hero banner -->
        <div class="relative rounded-2xl overflow-hidden bg-black">
          <img src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1600&auto=format&fit=crop"
            alt="Hero" class="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div class="relative p-8 md:p-10 lg:p-12 min-h-[280px] flex items-center justify-center text-center">
            <div>
              <div class="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/70 text-gray-200 text-xs mx-auto">
                <span class="i-lucide-badge-check mr-1"></span>
                ChatGPT
              </div>
              <div class="mt-4 text-white text-2xl md:text-3xl font-semibold">
                Up To 300 PTS Free For One Month
              </div>
              <div class="mt-5">
                <UButton color="success" size="sm">Use Now</UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories chips -->
        <div class="flex gap-3 overflow-x-auto flex-nowrap">
          <UButton v-for="cat in categories" :key="cat.label" variant="outline" size="sm" :icon="cat.icon"
            class="shrink-0">
            {{ cat.label }}
          </UButton>
        </div>

        <!-- Top Tools -->
        <div>
          <SectionTitle title="Top Tools" />
          <Swiper :modules="[Pagination]" :slides-per-view="1" :space-between="16" :breakpoints="{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 6 },
          }" :pagination="{ clickable: true }" class="!pb-8">
            <SwiperSlide v-for="tool in topTools" :key="tool.id">
              <ToolCard :tool="tool" badge="Trending" cta-label="Try Now" cta-color="info" @cta="onCta" />
            </SwiperSlide>
          </Swiper>

        </div>
        <!-- New Arrivals -->
        <div>
          <SectionTitle title="New Arrivals" />
          <swiper  :modules="[Pagination]" :slides-per-view="1" :space-between="16" :breakpoints="{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 6 },
          }" :pagination="{ clickable: true }" class="!pb-8">
            <swiper-slide v-for="tool in newArrivals" :key="tool.id">
              <ToolCard :tool="tool" badge="New" :cta-label="tool.cta" :cta-color="tool.ctaColor" @cta="onCta" />
            </swiper-slide>
          </swiper>
        </div>
        <!-- For You header -->
        <div class="flex items-center justify-between">
          <div class="text-gray-800 font-semibold">for You</div>
          <UButton variant="link" size="sm">View All</UButton>
        </div>

        <!-- For You grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ForYouCard v-for="item in forYou" :key="item.id" :item="item" />
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <QuickActionCard v-for="qa in quickActions" :key="qa.title" :title="qa.title" :image="qa.image" :bg="qa.bg" />
        </div>

        <!-- Free & Low point tools -->
        <ToolGridSection title="Free & Low point tools" :tools="freeLow" @cta="onCta" />

        <!-- All tools -->
        <ToolGridSection title="All tools" :tools="allTools" @cta="onCta" />

      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useDashboard } from '~/composables/useDashboard'
import ToolCard from '~/components/marketplace/ToolCard.vue'
import SectionTitle from '~/components/marketplace/SectionTitle.vue'
import ForYouCard from '~/components/marketplace/ForYouCard.vue'
import QuickActionCard from '~/components/marketplace/QuickActionCard.vue'
import ToolGridSection from '~/components/marketplace/ToolGridSection.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
// register modules
const modules = [Pagination]
// definePageMeta({
//   layout: 'default',
//   middleware: 'auth',
//   requiresAuth: true
// })

const { isNotificationsSlideoverOpen } = useDashboard()

const search = ref('')
const locale = ref<'en' | 'es'>('en')

const megaMenuItems = [
  { label: 'Products', to: '/products' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
] satisfies DropdownMenuItem[]

const profileItems = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
  { label: 'Sign out', icon: 'i-lucide-log-out', to: '/logout' }
] satisfies DropdownMenuItem[]

// Header points (from backend)
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
    headerPoints.value = isNaN(raw) ? 0 : raw
  } catch {
    // ignore
  }
}

onMounted(() => {
  fetchPointsFromBackend()
})

const categories = [
  { label: 'AI Design', icon: 'i-lucide-badge-check' },
  { label: 'AI Design', icon: 'i-lucide-badge-check' },
  { label: 'AI Chatbots', icon: 'i-lucide-bot' },
  { label: 'Text Generation', icon: 'i-lucide-text-cursor' },
  { label: 'Image Generation', icon: 'i-lucide-image' },
  { label: 'Speech Recognition', icon: 'i-lucide-waveform' },
  { label: 'Video Generation', icon: 'i-lucide-video' },
  { label: 'Music Generation', icon: 'i-lucide-music' },
  { label: 'Music Generation', icon: 'i-lucide-music' }
]

const topTools = [
  { id: 1, name: 'ChatGPT', icon: 'https://api.iconify.design/logos:openai.svg', points: 4 },
  { id: 2, name: 'Deepseek', icon: 'https://api.iconify.design/simple-icons:deepseek.svg', points: 342 },
  { id: 3, name: 'Gemini', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 342 },
  { id: 4, name: 'Gemini', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 342 },
  { id: 5, name: 'Copilot', icon: 'https://api.iconify.design/simple-icons:githubcopilot.svg', points: 342 },
  { id: 6, name: 'Midjourney', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 342 },
  { id: 6, name: 'Midjourney', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 342 },

]

const newArrivals = [
  { id: 1, name: 'ChatGPT', icon: 'https://api.iconify.design/logos:openai.svg', points: 4, cta: 'Use Tool', ctaColor: 'success' },
  { id: 2, name: 'Midjourney', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 4, cta: 'Try Now', ctaColor: 'info' },
  { id: 3, name: 'Copilot', icon: 'https://api.iconify.design/simple-icons:githubcopilot.svg', points: 4, cta: 'Try Now', ctaColor: 'info' },
  { id: 4, name: 'Gemini', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 4, cta: 'Try Now', ctaColor: 'info' },
  { id: 5, name: 'Gemini', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 4, cta: 'Try Now', ctaColor: 'info' },
  { id: 6, name: 'Deepseek', icon: 'https://api.iconify.design/simple-icons:deepseek.svg', points: 4, cta: 'Try Now', ctaColor: 'info' },
  { id: 6, name: 'Deepseek', icon: 'https://api.iconify.design/simple-icons:deepseek.svg', points: 4, cta: 'Try Now', ctaColor: 'info' },

]

function onCta(tool: { id: number; name: string }) {
  // Placeholder for CTA behavior; navigate or open details as needed
  console.log('CTA clicked for', tool.name)
}

// For You data (mock, using internet images)
const forYou = [
  {
    id: 1,
    name: 'Voila',
    icon: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=64&h=64&fit=crop&auto=format',
    description: 'Create high-quality content with our free AI text generator',
    pointsLabel: '2,204 PTS'
  },
  {
    id: 2,
    name: 'Mistral',
    icon: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=64&h=64&fit=crop&auto=format',
    description: 'Create high-quality content with our free AI text generator',
    pointsLabel: '2,204 PTS'
  },
  {
    id: 3,
    name: 'Wit.ai',
    icon: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&auto=format',
    description: 'Create high-quality content with our free AI text generator',
    pointsLabel: '2,20$ PTS'
  },
  {
    id: 4,
    name: 'Voila',
    icon: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop&auto=format',
    description: 'Create high-quality content with our free AI text generator',
    pointsLabel: '2,204 PTS'
  },
  {
    id: 5,
    name: 'Mistral',
    icon: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=64&h=64&fit=crop&auto=format',
    description: 'Create high-quality content with our free AI text generator',
    pointsLabel: '2,204 PTS'
  },
  {
    id: 6,
    name: 'Wit.ai',
    icon: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=64&h=64&fit=crop&auto=format',
    description: 'Create high-quality content with our free AI text generator',
    pointsLabel: '2,20$ PTS'
  }
]

// Quick actions (mock)
const quickActions = [
  {
    title: 'Write Social Media Posts',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=320&h=240&fit=crop&auto=format',
    bg: 'linear-gradient(135deg, #f5e7d3, #e6c39c)'
  },
  {
    title: 'Generate Ad Creatives',
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=320&h=240&fit=crop&auto=format',
    bg: 'linear-gradient(135deg, #c6e7ef, #8ad0de)'
  },
  {
    title: 'Fix My Code',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=320&h=240&fit=crop&auto=format',
    bg: 'linear-gradient(135deg, #c7edcf, #9bdfb0)'
  },
  {
    title: 'Create Audio Clips',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=320&h=240&fit=crop&auto=format',
    bg: 'linear-gradient(135deg, #efc0d9, #e69ec6)'
  }
]

// Free & All tools (mocked close to design)
const freeLow = [
  { id: 101, name: 'ChatGPT', icon: 'https://api.iconify.design/logos:openai.svg', points: 4, tag: 'Free', cta: 'Use Tool', ctaColor: 'success' },
  { id: 102, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:deepseek.svg', points: 4, tag: 'Free', cta: 'Use Tool', ctaColor: 'success' },
  { id: 103, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 4, tag: 'Free', cta: 'Try Now', ctaColor: 'info' },
  { id: 104, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:openmoji.svg', points: 4, tag: 'Free', cta: 'Try Now', ctaColor: 'info' },
  { id: 105, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:githubcopilot.svg', points: 4, tag: 'Free', cta: 'Try Now', ctaColor: 'info' },
  { id: 106, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 4, tag: 'Free', cta: 'Try Now', ctaColor: 'info' },
  { id: 106, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 4, tag: 'Free', cta: 'Try Now', ctaColor: 'info' },

]

const allTools = [
  { id: 201, name: 'ChatGPT', icon: 'https://api.iconify.design/logos:openai.svg', points: 4, tag: 'New', cta: 'Try Now', ctaColor: 'info' },
  { id: 202, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:deepseek.svg', points: 4, tag: 'New', cta: 'Try Now', ctaColor: 'info' },
  { id: 203, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 4, tag: 'Trending', cta: 'Try Now', ctaColor: 'info' },
  { id: 204, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:githubcopilot.svg', points: 342, tag: 'Trending', cta: 'Try Now', ctaColor: 'info' },
  { id: 205, name: 'ChatGPT', icon: 'https://api.iconify.design/logos:openai.svg', points: 4, tag: 'New', cta: 'Use Tool', ctaColor: 'success' },
  { id: 206, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 4, tag: 'New', cta: 'Try Now', ctaColor: 'info' },
  { id: 207, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:openmoji.svg', points: 4, tag: 'Trending', cta: 'Try Now', ctaColor: 'info' },
  { id: 208, name: 'ChatGPT', icon: 'https://api.iconify.design/logos:openai.svg', points: 342, tag: 'Trending', cta: 'Try Now', ctaColor: 'info' },
  { id: 209, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:googlebard.svg', points: 4, tag: 'Free', cta: 'Try Now', ctaColor: 'info' },
  { id: 210, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:openmoji.svg', points: 4, tag: 'New', cta: 'Try Now', ctaColor: 'info' },
  { id: 211, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:deepseek.svg', points: 342, tag: 'Trending', cta: 'Try Now', ctaColor: 'info' },
  { id: 212, name: 'ChatGPT', icon: 'https://api.iconify.design/simple-icons:midjourney.svg', points: 4, tag: 'New', cta: 'Try Now', ctaColor: 'info' },
]
</script>