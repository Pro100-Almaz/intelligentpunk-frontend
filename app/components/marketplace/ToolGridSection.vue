<template>
  <section class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="text-gray-800 font-semibold">{{ title }}</div>
      <UButton variant="link" size="sm">View All</UButton>
    </div>

    <!-- Swiper -->
    <Swiper
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      :space-between="16"
      :breakpoints="{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 6 }
      }"
      pagination
      class="!pb-8"
    >
      <SwiperSlide v-for="tool in tools" :key="tool.id">
        <ToolCard
          :tool="tool"
          :badge-label="badgeLabel(tool)"
          :badge-color="badgeColor(tool)"
          :cta-label="ctaLabel(tool)"
          :cta-color="ctaColor(tool)"
          @cta="$emit('cta', tool)"
        />
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
