<template>
      <UCard class="h-full" :style="{ backgroundColor: item.color }">
    <div class="flex flex-col items-center justify-center py-4">
      <UIcon :name="item.icon" class="text-4xl mb-2" />
      <div class="font-medium">{{ item.name }}</div>
    </div>
  </UCard>
  </template>
  
  <script setup>
  defineProps({
    item: {
      type: Object,
      required: true
    }
  })
  </script>