<template>
    <UCard class="h-full">
      <div class="space-y-4">
        <div v-for="tool in tools" :key="tool.id" class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UAvatar :src="tool.icon" :alt="`${tool.name} logo`" size="sm" class="mr-3" />
              <div>
                <h3 class="font-bold">{{ tool.name }}</h3>
                <p class="text-xs text-gray-500">{{ tool.description }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold">{{ tool.pointsUsed }}</div>
              <div class="text-xs text-gray-500">pts Used</div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </template>
  
  <script setup>
  defineProps({
    tools: {
      type: Array,
      required: true
    }
  })
  </script>