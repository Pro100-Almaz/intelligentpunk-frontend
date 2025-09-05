<template>
  <UCard :ui="{ body: 'relative' }">
    <div class="flex items-center justify-between">
      <div class="pr-3">
        <div class="text-xs text-gray-500 mb-2">Number of Tools Used</div>
        <div class="text-3xl font-extrabold text-gray-900">
          {{ count }} Tools
        </div>
        <div class="text-sm text-gray-500 mt-2">You've used {{ count }} different tools this week.</div>
      </div>
      <img
        class="hidden md:block w-16 h-16 object-contain opacity-90"
        src="https://images.unsplash.com/photo-1551281044-8d8b7d82d94b?auto=format&fit=crop&w=160&q=60"
        alt="AI"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{ count: number }>()
</script>


