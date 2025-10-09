<script setup lang="ts">
import { ref, computed } from 'vue'

const models = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/gpt-4.1',
  'openai/gpt-3.5-turbo',
]

// Just use a ref — no cookies
const model = ref('openai/gpt-4o-mini')

const items = computed(() =>
  models.map(m => ({
    label: m,
    value: m,
    icon: `i-simple-icons-${m.split('/')[0]}`
  }))
)
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    :icon="`i-simple-icons-${model.split('/')[0]}`"
    variant="ghost"
    value-key="value"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
    placeholder="Select Model"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
    }"
  />
</template>
