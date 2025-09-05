<template>
  <div class="flex items-center justify-between mb-3">
    <div class="text-gray-800 font-semibold">{{ title }}</div>
    <slot name="controls" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>


