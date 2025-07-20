<script setup lang="ts">
import { ref } from 'vue'
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period, Range } from '~/types'

import FeedbackModal from '~/components/feedback/FeedbackModal.vue'

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})

function onSubmitBug(data: any) {
  console.log('Send bug to API:', data)
}
function onSubmitSuggest(data: any) {
  console.log('Send tool suggestion to API:', data)
}
function onVoteIdea(id: number) {
  console.log('Toggle vote for idea id:', id)
}

const period = ref<Period>('daily')

const feedbackModalOpen = ref(false)

</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>

          <!-- Feedback button -->
          <UTooltip text="Feedback" :shortcuts="['F']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="feedbackModalOpen = true"
            >
              <UIcon name="i-lucide-message-circle" class="size-5" />
            </UButton>
          </UTooltip>

        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <HomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>

  <FeedbackModal
    v-model="feedbackModalOpen"
    @submit-bug="onSubmitBug"
    @submit-suggest="onSubmitSuggest"
    @vote-idea="onVoteIdea"
  />
</template>
