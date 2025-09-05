<template>
  <UCard :ui="{ body: 'relative' }">
    <div class="text-xs text-gray-500 mb-2">Most Active Day</div>
    <div class="flex items-start justify-between">
      <div>
        <div class="text-3xl font-extrabold text-gray-900">{{ date }}</div>
        <div class="text-sm text-gray-500 mt-2">Your peak usage day — you were most active on {{ shortDate }}.</div>
      </div>
      <div class="hidden md:block w-20 h-20">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f4f4f5" stroke-width="6" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" stroke-width="6" stroke-dasharray="40 220" stroke-linecap="round" transform="rotate(-90 50 50)" />
          <line x1="50" y1="50" x2="50" y2="26" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
          <line x1="50" y1="50" x2="74" y2="50" stroke="#ea580c" stroke-width="3" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{ date: string }>()
const shortDate = computed(() => props.date)
</script>


