<template>
  <UDashboardPanel id="my-usage" class="p-0">
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

        <!-- right side (same as index) -->
        <template #right>
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-gray-100 rounded-lg px-3 py-2 border">
              <UIcon name="i-lucide-coins" class="size-4 text-yellow-600 mr-2" />
              <div class="text-sm">
                <span class="font-bold text-gray-900">{{ headerPointsLabel }}</span>
                <span class="text-gray-500 ml-1">pts</span>
              </div>
            </div>

            <UTooltip text="Switch language">
              <UButton variant="ghost" square @click="locale = locale === 'en' ? 'es' : 'en'">
                <UIcon :name="locale === 'en' ? 'i-twemoji-flag-united-kingdom' : 'i-twemoji-flag-spain'" class="size-5" />
              </UButton>
            </UTooltip>

            <UTooltip text="Scan">
              <UButton variant="ghost" square icon="i-lucide-image-plus" />
            </UTooltip>

            <UTooltip text="Notifications (N)">
              <UButton variant="ghost" square @click="isNotificationsSlideoverOpen = true">
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5" />
                </UChip>
              </UButton>
            </UTooltip>

            <UDropdownMenu :items="userMenuItems" trigger="hover">
              <div class="flex items-center cursor-pointer">
                <UAvatar size="sm" src="https://i.pravatar.cc/40?img=3" />
                <span class="ml-2 text-sm font-medium">admin</span>
                <UIcon name="i-lucide-chevron-down" class="size-4 ml-1" />
              </div>
            </UDropdownMenu>

            <UTooltip text="Settings">
              <UButton variant="ghost" square icon="i-lucide-settings" />
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Page tools -->
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-700">My Usage</h1>
          <div class="flex items-center gap-2">
            <!-- Range selector pill -->
            <UDropdownMenu :items="rangeMenuItems">
              <UButton
                variant="ghost"
                trailing-icon="i-lucide-chevron-down"
                class="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200"
              >
                {{ dateRangeLabel }}
              </UButton>
            </UDropdownMenu>

            <!-- Export group: light container with format + download -->
            <div class="bg-white rounded-xl p-1 flex items-center gap-2 shadow-sm border border-gray-200">
              <UDropdownMenu :items="exportMenuItems">
                <UButton
                  variant="ghost"
                  trailing-icon="i-lucide-chevron-down"
                  class="bg-gray-100 rounded-lg px-3 py-2"
                >
                  {{ exportFormat }}
                </UButton>
              </UDropdownMenu>
              <UButton
                variant="ghost"
                icon="i-lucide-download"
                class="rounded-lg px-2 text-gray-900"
                @click="handleExport"
              />
            </div>
          </div>
        </div>
        <!-- Top stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TotalPointsCard :points="127" />
          <ToolsUsedCard :count="6" />
          <MostUsedToolCard name="Deepseek" description="Your most frequently used tool — ideal for writing, editing, and generating content." />
          <MostActiveDayCard date="July 12, 2025" />
        </div>

        <!-- Filters & table -->
        <UCard>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <UInput v-model="toolSearch" placeholder="type tool name" icon="i-lucide-search" class="flex-1" />
              <USelect v-model="category" :items="categoryItems" />
              <USelect v-model="status" :items="statusItems" />
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-600">
                    <th class="text-left px-4 py-3 font-medium">Tool Used</th>
                    <th class="text-left px-4 py-3 font-medium">Type</th>
                    <th class="text-left px-4 py-3 font-medium">Date/Time</th>
                    <th class="text-left px-4 py-3 font-medium">Points Spent</th>
                    <th class="text-left px-4 py-3 font-medium">Result</th>
                    <th class="text-left px-4 py-3 font-medium">Status</th>
                    <th class="text-left px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in filteredLogs" :key="log.id" class="border-t border-gray-100 hover:bg-gray-50">
                    <td class="py-3">
                      <div class="flex items-center gap-2">
                        <UIcon :name="log.icon" class="size-4 text-gray-700" />
                        {{ log.tool }}
                      </div>
                    </td>
                    <td class="py-3">{{ log.type }}</td>
                    <td class="py-3">{{ log.time }}</td>
                    <td class="py-3">{{ log.points }}</td>
                    <td class="py-3"><UButton variant="link" size="xs">View</UButton></td>
                    <td class="py-3">
                      <span class="inline-flex items-center text-sm">
                        <span
                          class="w-2 h-2 rounded-full mr-2"
                          :class="log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'"
                        />
                        {{ log.status }}
                      </span>
                    </td>
                    <td class="py-3">
                      <UDropdownMenu :items="actionMenu">
                        <UButton
                          size="xs"
                          variant="soft"
                          :color="actionColor(log.action)"
                          class="rounded-full"
                          :leading-icon="actionIcon(log.action)"
                          trailing-icon="i-lucide-chevron-down"
                        >
                          {{ log.action }}
                        </UButton>
                      </UDropdownMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </UCard>

        <!-- Usage graph -->
        <UCard>
          <div class="flex items-center justify-between mb-6">
            <div class="text-gray-600 text-sm font-medium">Usage Graph</div>
            <div class="flex items-center gap-1">
              <UButton 
                size="sm" 
                variant="ghost" 
                :class="range==='day' ? 'bg-green-500 text-white hover:bg-green-600' : 'hover:bg-gray-100'" 
                @click="range='day'"
              >
                Day
              </UButton>
              <UButton 
                size="sm" 
                variant="ghost" 
                :class="range==='week' ? 'bg-green-500 text-white hover:bg-green-600' : 'hover:bg-gray-100'" 
                @click="range='week'"
              >
                Week
              </UButton>
              <UButton 
                size="sm" 
                variant="ghost" 
                :class="range==='months' ? 'bg-green-500 text-white hover:bg-green-600' : 'hover:bg-gray-100'" 
                @click="range='months'"
              >
                Months
              </UButton>
              <UButton 
                size="sm" 
                variant="ghost" 
                :class="range==='years' ? 'bg-green-500 text-white hover:bg-green-600' : 'hover:bg-gray-100'" 
                @click="range='years'"
              >
                Years
              </UButton>
            </div>
          </div>
          <div class="w-full h-80 relative">
            <!-- Y-axis labels -->
            <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>1000</span>
              <span>400</span>
              <span>200</span>
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>00</span>
            </div>
            
            <!-- X-axis labels -->
            <div class="absolute bottom-0 left-8 right-0 grid grid-cols-12 text-xs text-gray-500">
              <span class="text-center">Jan</span>
              <span class="text-center">Feb</span>
              <span class="text-center">Mar</span>
              <span class="text-center">Apr</span>
              <span class="text-center">May</span>
              <span class="text-center">Jun</span>
              <span class="text-center">Jul</span>
              <span class="text-center">Aug</span>
              <span class="text-center">Sep</span>
              <span class="text-center">Oct</span>
              <span class="text-center">Nov</span>
              <span class="text-center">Dec</span>
            </div>
            
            <!-- Grid lines -->
            <div class="absolute left-8 top-0 bottom-8 right-0">
              <div v-for="i in 8" :key="i" class="absolute w-full border-t border-gray-200" :style="{ top: `${(i-1) * 12.5}%` }"></div>
            </div>
            
            <!-- Chart bars -->
            <svg
              :viewBox="`0 0 ${chart.length * 50} 240`"
              class="w-full h-full absolute left-8 top-0 bottom-8"
              preserveAspectRatio="none"
            >
              <g fill="url(#grad)">
                <rect
                  v-for="(v, i) in chart"
                  :key="i"
                  :x="barX(i)"
                  :y="230 - v"
                  :width="barWidth"
                  :height="v"
                  rx="4"
                />
              </g>

              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#16a34a" />
                  <stop offset="100%" stop-color="#86efac" />
                </linearGradient>
              </defs>
            </svg>

          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import TotalPointsCard from '~/components/my-usage/Stats/TotalPointsCard.vue'
import ToolsUsedCard from '~/components/my-usage/Stats/ToolsUsedCard.vue'
import MostUsedToolCard from '~/components/my-usage/Stats/MostUsedToolCard.vue'
import MostActiveDayCard from '~/components/my-usage/Stats/MostActiveDayCard.vue'
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

// Header points
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
  } catch {}
}
onMounted(() => fetchPointsFromBackend())

// Table data
type LogRow = { id:number; tool:string; icon:string; type:string; time:string; points:string; status:'Success'|'Failed'; action:string }
const logs = ref<LogRow[]>([
  { id:1, tool:'Text Generator', icon:'i-lucide-type', type:'image', time:'July 5, 10:23 AM', points:'10 points', status:'Failed', action:'Refund' },
  { id:2, tool:'Logo Designer', icon:'i-lucide-paintbrush', type:'content', time:'July 5, 10:23 AM', points:'3 points', status:'Success', action:'Refund' },
  { id:3, tool:'Logo Maker', icon:'i-lucide-badge-check', type:'description', time:'July 5, 10:23 AM', points:'3 points', status:'Success', action:'Refund' },
  { id:4, tool:'Logo Creator', icon:'i-lucide-pencil', type:'text here', time:'July 5, 10:23 AM', points:'3 points', status:'Success', action:'Approve' },
  { id:5, tool:'Graphic Designer', icon:'i-lucide-image', type:'visual content', time:'July 6, 10:00 AM', points:'5 points', status:'Success', action:'Refund' },
  { id:6, tool:'Web Designer', icon:'i-lucide-monitor', type:'website layout', time:'July 6, 11:15 AM', points:'8 points', status:'Failed', action:'Retry' },
  { id:7, tool:'UX/UI Designer', icon:'i-lucide-layout', type:'user experience', time:'July 6, 11:30 AM', points:'7 points', status:'Success', action:'Refund' },
  { id:8, tool:'Brand Strategist', icon:'i-lucide-bot', type:'branding', time:'July 6, 11:45 AM', points:'10 points', status:'Success', action:'Approve' },
  { id:9, tool:'Content Creator', icon:'i-lucide-notebook-pen', type:'articles and posts', time:'July 6, 12:00 PM', points:'4 points', status:'Success', action:'Refund' },
])

const toolSearch = ref('')
const category = ref('Category')
const status = ref('Status')
const categoryItems = ['Category','Image','Content','Branding','Website']
const statusItems = ['Status','Success','Failed']

const filteredLogs = computed(() => {
  return logs.value.filter(r =>
    (toolSearch.value ? r.tool.toLowerCase().includes(toolSearch.value.toLowerCase()) : true) &&
    (status.value==='Status' ? true : r.status === status.value as any)
  )
})

const actionMenu: DropdownMenuItem[][] = [[
  { label: 'View' }, { label: 'Refund' }, { label: 'Approve' }, { label: 'Retry' }
]]

function actionColor(label: string) {
  if (label === 'Refund') return 'neutral'
  if (label === 'Approve') return 'success'
  if (label === 'Retry') return 'warning'
  return 'info'
}

function actionIcon(label: string) {
  if (label === 'Refund') return 'i-lucide-rotate-ccw'
  if (label === 'Approve') return 'i-lucide-badge-check'
  if (label === 'Retry') return 'i-lucide-refresh-ccw'
  return 'i-lucide-eye'
}

// Chart data
const range = ref<'day'|'week'|'months'|'years'>('months')
const chart = ref<number[]>([80, 100, 150, 80, 20, 220, 100, 400, 70, 140, 420, 100])

// Bar sizing and positioning so bars align with month labels
const barStep = 50 // distance between month centers in SVG units
const barWidth = 28 // actual bar width
function barX(index: number) {
  // Center each bar at index*barStep then subtract half width
  const center = index * barStep + (barStep / 2)
  return center - (barWidth / 2)
}

// Top tools (date range, export)
const dateRangeLabel = ref('Last 7 days')
const exportFormat = ref('PDF')
const rangeMenuItems: DropdownMenuItem[][] = [[
  { label: 'Last 7 days', onSelect: () => { dateRangeLabel.value = 'Last 7 days' } },
  { label: 'Last 30 days', onSelect: () => { dateRangeLabel.value = 'Last 30 days' } },
  { label: 'This month', onSelect: () => { dateRangeLabel.value = 'This month' } },
  { label: 'This year', onSelect: () => { dateRangeLabel.value = 'This year' } },
]]
const exportMenuItems: DropdownMenuItem[][] = [[
  { label: 'PDF', onSelect: () => { exportFormat.value = 'PDF' } },
  { label: 'CSV', onSelect: () => { exportFormat.value = 'CSV' } },
  { label: 'XLSX', onSelect: () => { exportFormat.value = 'XLSX' } },
]]
const toast = useToast()
function handleExport() {
  toast.add({ title: `Exported as ${exportFormat.value}` })
}

// simple profile menu items
const userMenuItems: DropdownMenuItem[][] = [[
  { label: 'Profile' },
  { label: 'Settings', to: '/settings' },
  { label: 'Logout' }
]]
</script>