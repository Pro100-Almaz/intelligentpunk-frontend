<template>
  <header class="bg-gray-50 border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Left side - Search -->
      <div class="flex-1 max-w-md">
        <UInput
          v-model="searchQuery"
          placeholder="Search here..."
          icon="i-heroicons-magnifying-glass-20-solid"
          size="md"
          class="w-full"
        />
      </div>

      <!-- Center - Mega Menu -->
      <div class="flex-1 flex justify-center">
        <UDropdown :items="megaMenuItems" :popper="{ placement: 'bottom' }">
          <UButton
            color="neutral"
            variant="ghost"
            trailing-icon="i-heroicons-chevron-down-20-solid"
            size="md"
          >
            Mega menu
          </UButton>
        </UDropdown>
      </div>

      <!-- Right side - Controls -->
      <div class="flex-1 flex items-center justify-end space-x-3">
        <!-- Points Balance -->
        <UButton
          v-if="isLoggedIn"
          color="neutral"
          variant="ghost"
          size="sm"
          class="relative"
          @click="navigateTo('/subscription')"
        >
          <UIcon name="i-lucide-coins" class="w-5 h-5 mr-2 text-amber-500" />
          <span class="text-sm text-gray-700">Points</span>
          <UBadge
            v-if="pointsLabel"
            :label="pointsLabel"
            color="amber"
            variant="solid"
            size="xs"
            class="ml-2"
          />
        </UButton>
        <!-- Country Flag -->
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          square
        >
          <span class="text-lg">🇺🇸</span>
        </UButton>

        <!-- Print/Document Icon -->
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-heroicons-document-text-20-solid"
          size="sm"
          square
        />

        <!-- Notifications -->
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-heroicons-bell-20-solid"
          size="sm"
          square
        >
          <UBadge
            v-if="notificationCount > 0"
            :label="notificationCount.toString()"
            color="error"
            variant="solid"
            size="xs"
            class="absolute -top-1 -right-1"
          />
        </UButton>

        <!-- User Menu -->
        <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
          <UButton
            color="neutral"
            variant="ghost"
            class="flex items-center space-x-2"
          >
            <UAvatar
              src="/placeholder.svg"
              :alt="user?.username || 'User'"
              size="sm"
            />
            <span class="text-sm font-medium text-gray-700">
              {{ user?.username || user?.email || 'User' }}
            </span>
            <UIcon name="i-heroicons-chevron-down-20-solid" class="w-4 h-4" />
          </UButton>
        </UDropdown>

        <!-- Settings -->
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-heroicons-cog-6-tooth-20-solid"
          size="sm"
          square
          @click="openSettings"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// Get auth state and functions
const { user, logout, isLoggedIn } = useAuth()
const toast = useToast()
const config = useRuntimeConfig()
const route = useRoute()

const points = ref<number | null>(null)
const loadingPoints = ref(false)
const pointsLabel = computed(() => {
  if (points.value === null) return ''
  // show as integer-like label
  return Math.round(points.value).toLocaleString()
})

async function fetchPoints() {
  try {
    if (!isLoggedIn.value) return
    loadingPoints.value = true
    const auth = useAuthStore()
    const data = await $fetch<{ balance: string | number }>(`${config.public.apiBase}/api/balance/`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    const raw = typeof data.balance === 'string' ? parseFloat(data.balance) : Number(data.balance)
    points.value = isNaN(raw) ? 0 : raw
  } catch (e) {
    // silently ignore
  } finally {
    loadingPoints.value = false
  }
}

onMounted(() => {
  fetchPoints()
})

// Refresh after returning from successful payment (subscription page appends ?success=true)
watch(() => route.fullPath, (newPath) => {
  if (newPath.includes('success=true')) {
    fetchPoints()
  }
})

// Search functionality
const searchQuery = ref('')

// Notification count
const notificationCount = ref(3)

// Mega menu items
const megaMenuItems = [
  [{
    label: 'Dashboard',
    icon: 'i-heroicons-home-20-solid',
    to: '/dashboard'
  }],
  [{
    label: 'Products',
    icon: 'i-heroicons-cube-20-solid',
    to: '/products'
  }, {
    label: 'Categories',
    icon: 'i-heroicons-tag-20-solid',
    to: '/categories'
  }],
  [{
    label: 'Analytics',
    icon: 'i-heroicons-chart-bar-20-solid',
    to: '/analytics'
  }, {
    label: 'Reports',
    icon: 'i-heroicons-document-chart-bar-20-solid',
    to: '/reports'
  }],
  [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth-20-solid',
    to: '/settings'
  }]
]

// User menu items
const userMenuItems = [
  [{
    label: 'Profile',
    icon: 'i-heroicons-user-20-solid',
    to: '/profile'
  }, {
    label: 'Account Settings',
    icon: 'i-heroicons-cog-6-tooth-20-solid',
    to: '/settings'
  }],
  [{
    label: 'Help & Support',
    icon: 'i-heroicons-question-mark-circle-20-solid',
    to: '/help'
  }],
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-right-on-rectangle-20-solid',
    click: () => signOut()
  }]
]

// Methods
const openSettings = () => {
  navigateTo('/settings')
}

const signOut = () => {
  logout()
  toast.add({
    title: 'Signed out',
    description: 'You have been successfully signed out.',
    color: 'success'
  })
}

// Watch search query for real-time search
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 2) {
    // Perform search
    console.log('Searching for:', newQuery)
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
.relative {
  position: relative;
}
</style>