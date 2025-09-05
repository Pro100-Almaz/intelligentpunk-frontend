<template>
  <UCard :ui="{ body: 'relative' }">
    <div class="flex items-center justify-between">
      <div class="pr-3">
        <div class="text-xs text-gray-500 mb-2">Total Points Used</div>
        <div class="text-3xl font-extrabold text-gray-900">
          {{ points.toLocaleString() }}
          <span class="font-semibold ml-1">pts</span>
        </div>
        <div class="text-sm text-gray-500 mt-2">
          You've spent {{ points.toLocaleString() }} points on AI tools in the past 7 days.
        </div>
      </div>
      <div class="hidden md:block w-28 h-28 relative">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <path d="M18 70 A32 32 0 0 1 82 70" fill="none" stroke="#4ade80" stroke-width="8" stroke-linecap="round" />
          <path d="M26 70 A24 24 0 0 1 74 70" fill="none" stroke="#bbf7d0" stroke-width="7" stroke-linecap="round" />
          <path d="M34 70 A16 16 0 0 1 66 70" fill="none" stroke="#e7fee7" stroke-width="6" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{ points: number }>()
</script>


