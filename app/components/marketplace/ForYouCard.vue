<template>
  <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-md p-5 flex items-center gap-4">
    <!-- Fav icon -->
    <button class="absolute top-4 right-4 text-gray-400 hover:text-rose-500" @click.stop="$emit('favorite', item)">
      <UIcon :name="item.liked ? 'i-lucide-heart' : 'i-lucide-heart'" class="w-5 h-5" :class="item.liked ? 'text-rose-500' : ''" />
    </button>

    <!-- Logo -->
    <img :src="item.icon" alt="" class="w-12 h-12 rounded" />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-gray-900">{{ item.name }}</div>
      <div class="mt-1 text-sm text-gray-600 line-clamp-2">{{ item.description }}</div>
      <div class="mt-3">
        <UButton size="sm" color="success" variant="solid">Try Now</UButton>
      </div>
    </div>

    <!-- Points -->
    <div class="text-right text-gray-900 font-semibold whitespace-nowrap self-center">{{ item.pointsLabel }}</div>
  </div>
</template>

<script setup lang="ts">
interface ForYouItem {
  id: number
  name: string
  icon: string
  description: string
  pointsLabel: string
  liked?: boolean
}

defineProps<{ item: ForYouItem }>()
defineEmits<{ (e: 'favorite', item: ForYouItem): void }>()
</script>


