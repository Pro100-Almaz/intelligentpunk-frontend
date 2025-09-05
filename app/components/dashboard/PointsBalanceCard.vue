<template>
  <UCard class="h-full">
    <div class="text-gray-500 mb-1 text-sm">Points Balance</div>
    <div class="text-4xl font-bold mb-1">{{ points.total.toLocaleString() }}</div>
    <div class="text-rose-500 text-sm mb-6">
      {{ points.expiring.amount }} pts expiring in {{ points.expiring.days }} days
    </div>
    <div class="self-end">
      <UButton @click="goToSubscription">Buy More Points</UButton>
    </div>
  </UCard>
</template>

<script setup>
const router = useRouter()

defineProps({
  points: {
    type: Object,
    required: true
  }
})

function goToSubscription() {
  router.push('/subscription')
}
</script>