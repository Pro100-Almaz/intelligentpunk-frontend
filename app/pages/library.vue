<template>
  <UDashboardPanel id="library" class="p-0">
    <template #header>
      <UDashboardNavbar class="bg-gray-50">
        <!-- left side -->
        <template #leading>
          <div class="flex items-center space-x-4">
            <UInput
              v-model="search"
              placeholder="Search here…"
              size="md"
              clearable
              icon="i-lucide-search"
              class="min-w-[220px]"
            />

            <UDropdownMenu
              label="Mega menu"
              :items="megaMenuItems"
              size="md"
              variant="outline"
            />
          </div>
        </template>

        <!-- right side (exact as index.vue) -->
        <template #right>
          <div class="flex items-center space-x-3">
            <!-- Points Display -->
            <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 border">
              <UIcon name="i-lucide-coins" class="size-4 text-yellow-600 mr-2" />
              <div class="text-sm">
                <span class="font-bold text-gray-900">{{ headerPointsLabel }}</span>
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
            <UDropdownMenu :items="profileItems" trigger="hover">
              <div class="flex items-center cursor-pointer">
                <UAvatar
                  size="sm"
                  src="https://i.pravatar.cc/40?img=3"
                />
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
      <div class="p-6 space-y-4">
        <!-- Toolbar (full-width, like screenshot) -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-8">
            <UDropdownMenu :items="assetMenuItems">
              <UButton
                color="neutral"
                variant="ghost"
                class="px-0 font-medium"
                trailing-icon="i-lucide-chevron-down"
              >
                {{ assetFilter }}
              </UButton>
            </UDropdownMenu>

            <UDropdownMenu :items="sortMenuItems">
              <UButton
                color="neutral"
                variant="ghost"
                class="px-0 font-medium"
                trailing-icon="i-lucide-chevron-down"
              >
                {{ sortKey }}
              </UButton>
            </UDropdownMenu>
          </div>

          <div class="flex items-center">
            <div class="inline-flex items-center gap-1 bg-white/70 border border-gray-200 rounded-lg p-1">
              <UButton
                :class="viewMode === 'grid' ? 'bg-gray-100' : ''"
                variant="ghost"
                square
                icon="i-lucide-layout-grid"
                @click="viewMode = 'grid'"
              />
              <UButton
                :class="viewMode === 'list' ? 'bg-gray-100' : ''"
                variant="ghost"
                square
                icon="i-lucide-list"
                @click="viewMode = 'list'"
              />
            </div>
          </div>
        </div>

        <!-- Header row -->
        <div class="hidden md:grid grid-cols-12 items-center text-sm text-gray-500 px-3">
          <div class="col-span-6">Name</div>
          <div class="col-span-3">Tools Use</div>
          <div class="col-span-2">Last modified</div>
          <div class="col-span-1"></div>
        </div>

        <!-- Items list -->
        <div class="space-y-1">
          <div
            v-for="item in sortedAssets"
            :key="item.id"
            class="grid grid-cols-12 items-center p-5 md:p-6 hover:bg-gray-50"
          >
            <!-- Name + thumbnail -->
            <div class="col-span-12 md:col-span-6 flex items-center gap-4">
              <img :src="item.thumbnail" alt="" class="w-28 h-20 md:w-36 md:h-24 rounded-lg object-cover" />
              <div class="truncate">
                <div class="font-medium truncate">{{ item.title }}</div>
                <div class="text-xs text-gray-500 truncate">{{ item.subtitle }}</div>
              </div>
            </div>

            <!-- Tool used -->
            <div class="col-span-6 md:col-span-3 mt-2 md:mt-0 flex items-center gap-2">
              <UIcon :name="item.tool.icon" class="size-4" />
              <span class="text-sm text-gray-700">{{ item.tool.name }}</span>
            </div>

            <!-- Last modified -->
            <div class="col-span-6 md:col-span-2 mt-2 md:mt-0 text-sm text-gray-600">
              {{ timeAgo(item.modifiedAt) }}
            </div>

            <!-- Row actions (reserve column at right) -->
            <div class="col-span-6 md:col-span-1 mt-2 md:mt-0 flex justify-end">
              <UDropdownMenu :items="rowMenuItems">
                <UButton color="neutral" variant="ghost" size="xs" square icon="i-heroicons-ellipsis-vertical" />
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
  
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  requiresAuth: true,
})

const { isNotificationsSlideoverOpen } = useDashboard()

const search = ref('')
const locale = ref<'en'|'es'>('en')
const megaMenuItems = [
  { label: 'Products', to: '/products' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
] satisfies DropdownMenuItem[]

// Toolbar state
const assetOptions = [ 'All Assets', 'My Assets', 'Shared with me' ]
const sortOptions = [ 'Last Viewed', 'Last Modified', 'Name' ]
const assetFilter = ref('All Assets')
const sortKey = ref('Last Viewed')
const viewMode = ref<'list' | 'grid'>('list')

const assetMenuItems: DropdownMenuItem[][] = [[
  ...assetOptions.map(label => ({ label, onSelect: () => { assetFilter.value = label } }))
]]
const sortMenuItems: DropdownMenuItem[][] = [[
  ...sortOptions.map(label => ({ label, onSelect: () => { sortKey.value = label } }))
]]

// Header points (same as index.vue)
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
  } catch {
    // ignore
  }
}
onMounted(() => {
  fetchPointsFromBackend()
})

// Profile dropdown items (minimal)
const profileItems = [[
  { label: 'Profile', icon: 'i-lucide-user' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
]]

// Mock data representing the screenshot
type Tool = { name: string; icon: string }
type Asset = { id: number; title: string; subtitle: string; thumbnail: string; tool: Tool; modifiedAt: Date }

const assets = ref<Asset[]>([
  { id: 1, title: 'Email Draft – Client Follow-up', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=480&q=60', tool: { name: 'DeepSeek', icon: 'i-lucide-brain' }, modifiedAt: new Date(Date.now() - 3 * 60 * 1000) },
  { id: 2, title: 'Video Script – AI Trends 2025', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=480&q=60', tool: { name: 'Gemini', icon: 'i-lucide-star' }, modifiedAt: new Date(Date.now() - 56 * 60 * 1000) },
  { id: 3, title: 'Email Draft – Project Orion Check-in', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=480&q=60', tool: { name: 'DeepSeek', icon: 'i-lucide-brain' }, modifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { id: 4, title: 'Email Draft – Project Titan Progress Report', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=480&q=60', tool: { name: 'Claude', icon: 'i-lucide-sparkles' }, modifiedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
  { id: 5, title: 'Email Draft – Project Nebula Review', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1551281044-8d8b7d82d94b?auto=format&fit=crop&w=480&q=60', tool: { name: 'MidJourney', icon: 'i-lucide-image' }, modifiedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
  { id: 6, title: 'Email Draft – Project Eclipse Follow-up', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=480&q=60', tool: { name: 'DeepSeek', icon: 'i-lucide-brain' }, modifiedAt: new Date(Date.now() - 21 * 60 * 60 * 1000) },
  { id: 7, title: 'Email Draft – Project Atlas Status Inquiry', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=480&q=60', tool: { name: 'Copilot', icon: 'i-lucide-code' }, modifiedAt: new Date(Date.now() - 23 * 60 * 60 * 1000) },
  { id: 8, title: 'Email Draft – Project Voyager Next Steps', subtitle: '', thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7d?auto=format&fit=crop&w=480&q=60', tool: { name: 'DeepSeek', icon: 'i-lucide-brain' }, modifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
])

const sortedAssets = computed(() => {
  const list = assets.value.slice()
  if (sortKey.value === 'Name') return list.sort((a, b) => a.title.localeCompare(b.title))
  if (sortKey.value === 'Last Modified') return list.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())
  // Last Viewed fallback same as Last Modified for demo
  return list.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())
})

const rowMenuItems = [[
  { label: 'Open' },
  { label: 'Rename' },
  { label: 'Duplicate' },
], [
  { label: 'Move to...' },
  { label: 'Delete', color: 'error' as const },
]]

function timeAgo(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true })
}
</script>