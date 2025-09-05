<template>
  <div
    class="relative rounded-2xl p-6 text-gray-900 overflow-hidden"
    :style="{ background: bg }"
  >
    <div class="font-semibold mb-4">{{ title }}</div>
    <img :src="image" alt="" class="w-40 h-40 object-contain" />

    <button class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center">
      <UIcon name="i-lucide-arrow-up-right" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; image: string; bg: string }>()
</script>


