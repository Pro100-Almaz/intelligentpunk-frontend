<script setup lang="ts">
import { ref, computed, watchEffect, watch, nextTick } from 'vue'

const props = defineProps<{
  models: any
}>()

// Currently selected model
const model = ref('')

// Computed list of all items
const items = computed(() => {
  const result: { label: string; value: string; icon: string }[] = []
  const providers = props.models?.providers || props.models || []

  providers.forEach((provider: any) => {
    provider?.instruments?.forEach((instrument: any) => {
      instrument?.models?.forEach((modelName: string) => {
        const fullName = `${provider.name}/${modelName}`
        result.push({
          label: `${provider.name} - ${modelName}`,
          value: fullName,
          icon: `i-simple-icons-${provider.name}`
        })
      })
    })
  })

  return result
})

// Find the selected item from the list
const selectedItem = computed(() => items.value.find(i => i.value === model.value))

// Reactive icon state
const selectedIcon = ref('')

// Ensure the icon updates immediately when model or items change
watchEffect(() => {
  selectedIcon.value = selectedItem.value?.icon || ''
})

// Optional: if models are loaded asynchronously, re-trigger reactivity
watch(
  () => props.models,
  async () => {
    await nextTick()
    model.value = model.value // trigger reactivity refresh
  },
  { deep: true, immediate: true }
)

// Optional: if no model is preselected, select the first one
watch(items, (val) => {
  if (val.length && !model.value) {
    model.value = val[0]?.value || ''
  }
})
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    :icon="selectedIcon"
    variant="ghost"
    value-key="value"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
    placeholder="Select Model"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
    }"
  />
</template>
