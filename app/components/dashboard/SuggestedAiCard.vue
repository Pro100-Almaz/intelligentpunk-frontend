<template>
      <UCard class="h-full">
    <h2 class="text-sm font-medium text-gray-600 mb-4">Suggested AI based on your chat history</h2>
    
    <div class="space-y-4">
      <UCard v-for="item in suggestions" :key="item.id" class="bg-gray-50 dark:bg-gray-800">
        <div class="grid grid-cols-6 gap-4 items-center">
          <!-- First column: AI Icon (1/6) -->
          <div class="col-span-1 flex justify-center">
            <UAvatar :src="item.icon" :alt="`${item.name} logo`" size="3xl" />
          </div>
          
          <!-- Second column: Name, Description, Button (3/6) -->
          <div class="col-span-3 flex flex-col space-y-2">
            <h3 class="font-bold text-sm">{{ item.name }}</h3>
            <p class="text-xs text-gray-500">{{ item.description }}</p>
            <UButton size="sm" class="w-fit">
              Try Now
            </UButton>
          </div>
          
          <!-- Third column: Points Cost (2/6) -->
          <div class="col-span-2 text-right">
            <div class="font-bold text-lg">{{ item.points.toLocaleString() }}</div>
            <div class="text-xs text-gray-500">pts</div>
          </div>
        </div>
      </UCard>
    </div>
  </UCard>
  </template>
  
  <script setup>
  defineProps({
    suggestions: {
      type: Array,
      required: true
    }
  })
  </script>