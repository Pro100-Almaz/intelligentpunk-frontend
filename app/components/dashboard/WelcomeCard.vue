<template>
  <UCard class="overflow-hidden rounded-xl h-full bg-white dark:bg-gray-900">
    <!-- Top band (white) -->
    <div class="bg-white dark:bg-gray-900 px-6 py-4 flex items-center space-x-4">
      <UAvatar :src="user.avatar" alt="User avatar" size="3xl" />
      <div>
        <div class="text-gray-500 text-sm">Welcome back,</div>
        <div class="text-xl font-bold">{{ user }}</div>
      </div>
    </div>

    <!-- Bottom band (light gray) -->
    <div class="bg-white dark:bg-gray-900 px-6 py-5 border-t border-gray-200">
      <div class="flex items-center text-rose-500 mb-2">
        <UIcon name="i-heroicons-light-bulb" class="size-5 mr-2" />
        <span class="text-sm font-medium">Tip of the Day</span>
      </div>
      <p class="text-gray-800 dark:text-white">
        “{{ tip.text }}”
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface User {
  name: string
  avatar: string
}
interface Tip {
  text: string
}

const props = defineProps<{
  user: User
  tip: Tip
}>()
</script>
