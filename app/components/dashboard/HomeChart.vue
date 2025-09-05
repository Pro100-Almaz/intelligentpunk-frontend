<template>
    <UCard class="mt-6 p-4">
      <template #header>
        <h3 class="text-lg font-medium">Usage Over Time</h3>
      </template>
  
      <div class="py-4">
        <UChart :data="chartData" height="240" />
      </div>
    </UCard>
  </template>
  
  <script setup lang="ts">
  import type { Period, Range } from '~/types'
  import { ref, watch, onMounted } from 'vue'
  
  // same props signature
  const props = defineProps<{ period: Period; range: Range }>()
  
  // shape compatible with Nuxt UI's UChart (Chart.js)
  const chartData = ref<{
    labels: string[],
    datasets: Array<{
      label: string,
      data: number[],
      borderColor: string,
      backgroundColor: string
    }>
  }>({
    labels: [],
    datasets: []
  })
  
  function getMockChart(period: Period, range: Range) {
    // e.g. 7 points for the last week
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const data   = [12, 19, 15, 22, 18, 24, 20]
    return {
      labels,
      datasets: [
        {
          label: 'Points Used',
          data,
          borderColor: '#F56565',
          backgroundColor: 'rgba(245,101,101,0.3)'
        }
      ]
    }
  }
  
  onMounted(() => {
    chartData.value = getMockChart(props.period, props.range)
  })
  watch(
    [() => props.period, () => props.range],
    () => { chartData.value = getMockChart(props.period, props.range) }
  )
  </script>
  