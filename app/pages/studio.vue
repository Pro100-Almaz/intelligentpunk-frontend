<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-60 bg-gray-50 border-r border-gray-200 flex flex-col dark:bg-gray-800 bg-white">
      <!-- Header -->
      <div class="p-4 pb-0 border-gray-200 ">
        <div class="flex justify-between items-center gap-3">
          <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" />
          <UButton icon="i-lucide-panel-left" variant="ghost" size="sm" />
        </div>
      </div>

      <!-- Navigation + History -->
      <div class="flex-1 flex flex-col min-h-0 p-4 space-y-4 ">
        <div class="space-y-2 shrink-0">
          <UButton icon="i-lucide-home" variant="ghost" size="xs"
            class="w-full justify-start gap-x-2 text-black dark:text-white" @click="navigateTo('/')">
            <p class="text-xs text-black dark:text-white">Go to Dashboard</p>
          </UButton>
          <UButton icon="i-lucide-folder" variant="ghost" size="xs"
            class="w-full justify-start gap-x-2 text-black dark:text-white">
            <p class="text-xs text-black dark:text-white">Open Assets</p>
          </UButton>
          <UButton icon="i-lucide-git-branch" variant="ghost" size="xs"
            class="w-full justify-start gap-x-2 text-black dark:text-white">
            <p class="text-xs text-black dark:text-white">Discover Workflows</p>
          </UButton>
          <UButton icon="i-lucide-pencil" variant="ghost" size="xs"
            class="w-full justify-start gap-x-2 text-black dark:text-white" @click="handleNewSession">
            <p class="text-xs text-black dark:text-white">New Session</p>
          </UButton>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto">
          <h3 class="text-sm mb-3 text-black dark:text-white">History</h3>
          <div class="space-y-1 text-xs">
            <div v-for="chat in chats" :key="chat.id">
              <UButton variant="ghost" size="xs" class="w-full justify-start gap-x-2" @click="handleLoadChat(chat)">
                <UIcon name="i-lucide-message-circle" class="shrink-0 w-4 h-4 text-black" />
                <span class="truncate text-xs">
                  <p class="text-black dark:text-white">
                    {{ chat.title || 'New Chat' }}
                  </p>
                </span>
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="p-4 border-t border-gray-200 shrink-0">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 bg-green-300 rounded"></div>
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">Intelligent</div>
            <div class="text-xs text-gray-500">Free</div>
          </div>
        </div>
        <UButton class="w-full py-3 bg-green-600 hover:bg-green-600 justify-center text-white">
          Upgrade
        </UButton>
      </div>
    </div>

    <!-- Main Chat Panel -->
    <div class="flex-1 flex flex-col dark:bg-gray-800 bg-white">
      <!-- Top bar -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 class="text-lg font-semibold text-black dark:text-white">{{ chatTitle }}</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-yellow-400 rounded-full"></div>
            <span class="text-sm font-medium">1000 points</span>
          </div>
          <UButton icon="i-lucide-more-vertical" variant="ghost" size="sm" />
        </div>
      </div>

      <!-- Chat container -->
      <UContainer
        class="flex-1 flex flex-col max-w-4xl mx-auto sm:gap-6 overflow-hidden dark:bg-gray-800 bg-white pt-4">
        <!-- Messages -->
        <div class="flex-1 overflow-y-auto pr-2">
          <UChatMessages :messages="messages" :status="isLoading ? 'streaming' : 'ready'" :assistant="{
            variant: 'solid',
            actions: [
              {
                label: 'Copy',
                icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy',
                onClick: () => copy(lastMessageText)
              }
            ]
          }" :user="{ variant: 'solid' }" class="pb-4 sm:pb-6" :spacing-offset="160">
            <template #content="{ message }">
              <div class="space-y-4">
                <template v-for="(part, index) in message.parts" :key="`${part.type}-${index}-${message.id}`">
                  <UButton v-if="part.type === 'reasoning' && 'state' in part && part.state !== 'done'"
                    label="Thinking..." variant="link" color="neutral" class="p-0" loading />
                </template>
                <div v-html="getTextFromMessage(message)" class="prose prose-sm max-w-none" />
              </div>
            </template>
          </UChatMessages>
          <div v-if="isAnalyzing" class="px-4 sm:px-6">
            <div
              class="w-full px-4 py-2 text-black dark:text-white text-sm rounded-md flex items-center gap-2">
              <UIcon name="i-lucide-brain-circuit" class="w-4 h-4 text-black dark:text-white animate-pulse" />
              <span>Thinking...</span>
            </div>
          </div>
        </div>

        <!-- Prompt -->
        <UChatPrompt v-model="input" :error="error" variant="soft"
          class="sticky bottom-10 dark:bg-gray-700 bg-white text-black z-10 shadow-md" @submit="handleSend">
          <UChatPromptSubmit :status="isLoading ? 'streaming' : 'ready'" color="primary" @stop="() => { }"
            @reload="() => { }" />

          <template #footer>
            <ModelSelect v-model="model"  :models="models"/>
          </template>
        </UChatPrompt>
      </UContainer>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'studio' })

import { ref, onMounted, computed } from 'vue'
import { useAI } from '~/composables/useAI'
import ModelSelect from '@/components/ModelSelect.vue'

// state
const isNewSession = ref(true)
const isAnalyzing = ref(false)
const chatTitle = ref('New Chat')
const copied = ref(false)
const currentChatId = ref<string | null>(null)
const input = ref('')

// composable
const { chats, messages, models, isLoading, sendMessage, clearMessages, getHistory, loadChat, getModels, createConversation } = useAI()
const error = computed(() => {
  const errorMessage = useAI().error?.value;
  return errorMessage ? new Error(errorMessage) : undefined;
})
const { model } = useModels()

// utils
function getTextFromMessage(message: any) {
  return message.content || ''
}

const lastMessageText = computed(() =>
  (messages.value?.length ?? 0) > 0 ? messages.value[messages.value.length - 1]?.content ?? '' : ''
)

function copy(text: string) {
  if (!text) return
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

// actions
async function handleSend() {
  if (!input.value.trim()) return

  const message = input.value
  input.value = ''

  isAnalyzing.value = true

  if (isNewSession.value) {
    const newChatId = await createConversation(1, message)
    console.log('Created new conversation with ID:', newChatId)
    if (newChatId) {
      currentChatId.value = newChatId
      chatTitle.value = message
      await sendMessage(message, true, model.value, currentChatId.value)
      isNewSession.value = false
    }
  } else if (currentChatId.value) {
    await sendMessage(message, true, model.value, currentChatId.value)
  } else {
    console.warn('⚠️ No chat ID found for existing chat.')
  }

  isAnalyzing.value = false
  await getHistory()
}


function handleNewSession() {
  clearMessages()
  chatTitle.value = 'New Chat'
  isNewSession.value = true
  currentChatId.value = null

}

async function handleLoadChat(chat: { id: string; title: string }) {
  await loadChat(chat.id)
  chatTitle.value = chat.title || 'New Chat'
  currentChatId.value = chat.id
  isNewSession.value = false
}

// init
onMounted(() => {
  getHistory()
  getModels()
})
</script>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) transparent;
}

/* pierce child component CSS and override the highlighted text rules */
:deep(.text-highlighted),
:deep(.text-highlighted) textarea,
:deep(.text-highlighted) .w-full {
  color: #111 !important;
  /* visible input text */
}

/* placeholder */
:deep(.text-highlighted) textarea::placeholder,
:deep(.text-highlighted)::placeholder {
  color: rgba(0, 0, 0, 0.45) !important;
  /* readable placeholder */
}

:deep(.text-inverted),
:deep(.text-inverted) div {
  color: #111 !important;
  background-color: #e4e4e4 !important;
  /* visible input text */
}

/* placeholder */
:deep(.text-highlighted) textarea::placeholder,
:deep(.text-highlighted)::placeholder {
  color: rgba(0, 0, 0, 0.45) !important;
  /* readable placeholder */
}

@media (prefers-color-scheme: dark) {

  :deep(.text-highlighted),
  :deep(.text-highlighted) textarea,
  :deep(.text-highlighted) .w-full {
    color: #fff !important;
  }

  :deep(.text-highlighted) textarea::placeholder,
  :deep(.text-highlighted)::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
    /* softer white placeholder */
  }

  :deep(.text-inverted),
  :deep(.text-inverted) div {
    color: #fff !important;
    background-color: #111 !important;
    /* visible input text */
  }
}

:deep(.animate-pulse) {
  animation: pulse 1.8s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}
</style>
