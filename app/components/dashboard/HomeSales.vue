<template>
    <UCard class="mt-6 p-4">
      <template #header>
        <h3 class="text-lg font-medium">Recent Sales</h3>
      </template>
  
      <table class="w-full text-left mt-2">
        <thead>
          <tr class="border-b">
            <th class="py-2">Product</th>
            <th class="py-2">Amount</th>
            <th class="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in sales"
            :key="i"
            class="hover:bg-gray-50"
          >
            <td class="py-2">{{ row.product }}</td>
            <td class="py-2">{{ row.amount }}</td>
            <td class="py-2">{{ row.date }}</td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </template>
  
  <script setup lang="ts">
  import type { Period, Range } from '~/types'
  import { ref, watch, onMounted } from 'vue'
  
  const props = defineProps<{ period: Period; range: Range }>()
  
  // simple mock rows
  const sales = ref<Array<{ product: string; amount: number; date: string }>>([])
  
  function getMockSales(period: Period, range: Range) {
    return [
      { product: 'Alpha Pro',    amount: 120, date: '2025-07-10' },
      { product: 'Beta Suite',   amount:  75, date: '2025-07-12' },
      { product: 'Gamma Widget', amount: 200, date: '2025-07-14' },
      { product: 'Delta Prime',  amount:  45, date: '2025-07-15' },
      { product: 'Epsilon App',  amount:  90, date: '2025-07-16' },
    ]
  }
  
  onMounted(() => {
    sales.value = getMockSales(props.period, props.range)
  })
  watch(
    [() => props.period, () => props.range],
    () => { sales.value = getMockSales(props.period, props.range) }
  )
  </script>
  