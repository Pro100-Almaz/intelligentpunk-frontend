<template>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UCard
        v-for="item in stats"
        :key="item.label"
        class="flex items-center justify-between p-4"
      >
        <div>
          <p class="text-sm text-gray-500">{{ item.label }}</p>
          <p class="text-2xl font-semibold">{{ item.value }}</p>
        </div>
        <UIcon :name="item.icon" class="size-6 text-gray-400" />
      </UCard>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Period, Range } from '~/types'
  import { ref, watch, onMounted } from 'vue'
  
  // accept the same props so the API surface doesn't change
  const props = defineProps<{ period: Period; range: Range }>()
  
  // this will hold our mock stats
  const stats = ref<Array<{ label: string; value: number; icon: string }>>([])
  
  // a function to “generate” different mock data
  function getMockStats(period: Period, range: Range) {
    // you could vary by period/range if you like…
    return [
      { label: 'Total Users',        value: 1_234, icon: 'i-lucide-users' },
      { label: 'Active Sessions',    value:  567,   icon: 'i-lucide-activity' },
      { label: 'Completed Orders',   value:  89,    icon: 'i-lucide-shopping-cart' },
    ]
  }
  
  // load on mount and whenever period/range change
  onMounted(() => {
    stats.value = getMockStats(props.period, props.range)
  })
  watch(
    [() => props.period, () => props.range],
    () => { stats.value = getMockStats(props.period, props.range) }
  )
  </script>
  