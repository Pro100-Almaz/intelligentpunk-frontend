<template>
  <UCard class="bg-white dark:bg-gray-900 rounded-xl">
    <div class="flex items-center">
      <!-- Left: text & legend -->
      <div class="flex-1 pr-4">
        <!-- Header -->
        <div class="text-gray-500">Subscription status</div>
        <div class="mt-1 text-2xl font-bold">{{ subscription.type }}</div>

        <!-- Legend -->
        <div class="mt-4 space-y-2">
          <div class="flex items-center">
            <span class="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            <span class="text-gray-600 text-sm">
              {{ subscription.daysCompleted }} days trial complete
            </span>
          </div>
          <div class="flex items-center">
            <span class="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
            <span class="text-gray-600 text-sm">
              {{ subscription.daysLeft }} days trial left
            </span>
          </div>
          <div class="mt-6">
            <UButton
              variant="ghost"
              color="info"
              class="px-0 hover:underline hover:bg-white"
              trailing-icon="i-lucide-arrow-right"
            >
              Renew now
            </UButton>
          </div>
          
        </div>
      </div>

      <!-- Right: large progress donut -->
      <div class="flex-shrink-0">
        <div class="relative w-36 h-36">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <!-- track -->
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="10"
            />
            <!-- progress -->
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#22C55E"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="282.7"
              :stroke-dashoffset="282.7 * (1 - subscription.progress / 100)"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <!-- centered label -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ subscription.progress }}%
            </div>
            <div class="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Subscription {
  type: string
  progress: number
  daysCompleted: number
  daysLeft: number
}

const props = defineProps<{
  subscription: Subscription
}>()
</script>
