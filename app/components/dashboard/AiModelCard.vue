<template>
    <UCard class="h-full relative overflow-hidden">
      <div v-if="model.discount" class="absolute top-0 left-0 bg-rose-500 text-white text-xs px-2 py-1 rounded-br-md">
        {{ model.discount }}
      </div>
      
      <div class="flex flex-col items-center h-full">
        <div class="mb-2">
          <UAvatar :src="model.icon" :alt="`${model.name} logo`" size="lg" />
        </div>
        <h3 class="text-lg font-bold mb-1">{{ model.name }}</h3>
        <p class="text-sm text-gray-500 text-center mb-4">{{ model.description }}</p>
        
        <div class="mt-auto">
          <UButton size="sm" :color="model.color" variant="ghost">
            Try Now
          </UButton>
        </div>
      </div>
    </UCard>
  </template>
  
  <script setup>
  defineProps({
    model: {
      type: Object,
      required: true
    }
  })
  </script>