<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const route = useRoute()
const toast = useToast()

const sidebarOpen = ref(true) // Toggle for collapse/expand

const feedbackModalOpen = useState('feedback-modal-open', () => false)
const openFeedbackModal = () => { feedbackModalOpen.value = true }

const links = [[
  { label: 'Dashboard', icon: 'i-lucide-house', to: '/', onSelect: () => {} },
  { label: 'Marketplace', icon: 'i-lucide-shopping-bag', to: '/marketplace' },
  { label: 'My Usage', icon: 'i-lucide-chart-bar', to: '/my-usage' },
  { label: 'Studio', icon: 'i-lucide-palette', to: '/studio' },
  { label: 'Library', icon: 'i-lucide-book-open', to: '/library' },
  { label: 'Subscription', icon: 'i-lucide-credit-card', to: '/subscription' },
], [
  { label: 'Feedback', icon: 'i-lucide-message-circle', onSelect: () => { openFeedbackModal() } },
  { label: 'Help & Support', icon: 'i-lucide-info', to: 'https://github.com/nuxt/ui-pro', target: '_blank' }
]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-pro/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

onMounted(() => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') return
  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [
      { label: 'Accept', color: 'neutral', variant: 'outline', onClick: () => { cookie.value = 'accepted' } },
      { label: 'Opt out', color: 'neutral', variant: 'ghost' }
    ]
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar (left) -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out h-screen bg-white border-r border-gray-200 flex flex-col',
        sidebarOpen ? 'w-72' : 'w-16'
      ]"
    >
      <!-- Sidebar header with toggle -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100">
        <span v-if="sidebarOpen" class="font-bold text-lg">Menu</span>
        <UButton
          variant="ghost"
          size="sm"
          square
          @click="sidebarOpen = !sidebarOpen"
          class="ml-auto"
        >
          <UIcon :name="sidebarOpen ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'" />
        </UButton>
      </div>
      <!-- Navigation Menus -->
      <div class="flex-1 overflow-y-auto px-2 py-4">
        <UNavigationMenu :collapsed="!sidebarOpen" :items="links[0]" orientation="vertical" tooltip popover />
        <div class="mt-6">
          <UNavigationMenu :collapsed="!sidebarOpen" :items="links[1]" orientation="vertical" tooltip />
        </div>
      </div>
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-gray-100">
        <UserMenu :collapsed="!sidebarOpen" />
      </div>
    </aside>

    <!-- Main page content (right) -->
    <div 
      :class="[
        'transition-all duration-300 ease-in-out',
        sidebarOpen ? 'ml-72' : 'ml-16'
      ]"
    >
      <UDashboardSearch :groups="groups" />
      <slot />
      <NotificationsSlideover />
      <FeedbackModal v-model="feedbackModalOpen" />
    </div>
  </div>
</template>
