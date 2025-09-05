<template>
  <UCard :ui="{ body: 'relative' }">
    <div class="text-xs text-gray-500 mb-2">Most Used Tool</div>
    <div class="flex items-start justify-between">
      <div class="max-w-[70%]">
        <div class="text-3xl font-extrabold text-gray-900">{{ name }}</div>
        <div class="text-sm text-gray-500 mt-2">{{ description }}</div>
      </div>
      <div class="hidden md:flex items-center gap-2">
        <span class="w-8 h-8 rounded-full bg-blue-500/90 text-white grid place-items-center">Q</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{ name: string; description: string }>()
</script>


