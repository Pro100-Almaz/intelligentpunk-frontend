<template>
    <UCard class="h-full">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium text-gray-600">Recent Activity</h2>
      </div>
      
      <div class="space-y-4">
        <div v-for="activity in activities" :key="activity.id" class="flex items-center justify-between border-b pb-3 last:border-0">
          <div class="flex items-center">
            <UAvatar :src="activity.icon" size="sm" class="mr-3" />
            <div>
              <div class="font-medium">{{ activity.type }}</div>
              <div class="text-xs text-gray-500">{{ activity.time }}</div>
            </div>
          </div>
          <div class="text-sm text-gray-500">{{ activity.timeAgo }}</div>
        </div>
      </div>
    </UCard>
  </template>
  
  <script setup>
  defineProps({
    activities: {
      type: Array,
      required: true
    }
  })
  </script>