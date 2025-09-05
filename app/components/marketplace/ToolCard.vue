<template>
  <div class="relative bg-white rounded-xl p-4 shadow-md">
    <!-- Badge (Trending/New) -->
    <div v-if="badge || badgeLabel" class="absolute -top-2 left-3">
      <span
        class="text-[11px] px-2 py-1 rounded-full text-white"
        :class="computedBadgeClass"
      >
        {{ badgeLabel || badge }}
      </span>
    </div>

    <!-- Favorite icon -->
    <button class="absolute top-3 right-3 text-gray-400 hover:text-rose-500" @click.stop="$emit('favorite', tool)">
      <UIcon name="i-lucide-heart" class="w-4 h-4" />
    </button>

    <!-- Header -->
    <div class="flex items-center justify-between">
      <img :src="tool.icon" alt="" class="w-10 h-10 rounded" />
      <span class="i-lucide-badge-check text-green-500"></span>
    </div>

    <!-- Title & description -->
    <div class="mt-3 font-semibold">{{ tool.name }}</div>
    <div class="text-xs text-gray-500">a conversational AI chatbot<br/>developed by OpenAI</div>

    <!-- Footer -->
    <div class="mt-3 flex items-center justify-between">
      <UButton size="xs" :color="ctaColor" variant="soft" @click="$emit('cta', tool)">{{ ctaLabel }}</UButton>
      <span class="text-xs text-gray-600">{{ tool.points }} PTS</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ToolItem {
  id: number
  name: string
  icon: string
  points: number
}

const props = defineProps<{ 
  tool: ToolItem,
  badge?: 'Trending' | 'New',
  badgeLabel?: string,
  badgeColor?: 'rose' | 'blue' | 'amber' | 'green' | 'neutral' | string,
  ctaLabel: string,
  ctaColor: 'success' | 'info' | 'neutral' | 'warning' | 'error' | string
}>()

defineEmits<{
  (e: 'cta', tool: ToolItem): void
  (e: 'favorite', tool: ToolItem): void
}>()

const computedBadgeClass = computed(() => {
  if (props.badgeColor) return `bg-${props.badgeColor}-600`
  if (props.badge === 'Trending') return 'bg-rose-600'
  if (props.badge === 'New') return 'bg-blue-600'
  return 'bg-amber-500'
})
</script>


