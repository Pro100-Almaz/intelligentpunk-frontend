<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="text-gray-800 font-semibold">{{ title }}</div>
      <UButton variant="link" size="sm">View All</UButton>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      <ToolCard
        v-for="tool in tools"
        :key="tool.id"
        :tool="tool"
        :badge-label="badgeLabel(tool)"
        :badge-color="badgeColor(tool)"
        :cta-label="ctaLabel(tool)"
        :cta-color="ctaColor(tool)"
        @cta="$emit('cta', tool)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import ToolCard from '~/components/marketplace/ToolCard.vue'

interface ToolItem {
  id: number
  name: string
  icon: string
  points: number
  tag?: 'Free' | 'New' | 'Trending'
  cta?: string
  ctaColor?: 'success' | 'info'
}

const props = defineProps<{ title: string; tools: ToolItem[] }>()
defineEmits<{ (e: 'cta', tool: ToolItem): void }>()

function badgeLabel(tool: ToolItem) {
  return tool.tag === 'Free' ? 'Free' : tool.tag === 'Trending' ? 'Trending' : tool.tag === 'New' ? 'New' : ''
}
function badgeColor(tool: ToolItem) {
  return tool.tag === 'Free' ? 'amber' : tool.tag === 'Trending' ? 'rose' : tool.tag === 'New' ? 'blue' : 'neutral'
}
function ctaLabel(tool: ToolItem) {
  return tool.cta || 'Try Now'
}
function ctaColor(tool: ToolItem) {
  return tool.ctaColor || 'info'
}
</script>


