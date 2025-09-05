<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" />
          <UButton icon="i-lucide-layout-dashboard" variant="ghost" size="sm" />
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 p-4 space-y-4">
        <div class="space-y-2">
          <UButton icon="i-lucide-layout-dashboard" variant="ghost" class="w-full justify-start" @click="navigateTo('/')">Go to Dashboard</UButton>
          <UButton icon="i-lucide-folder-open" variant="ghost" class="w-full justify-start">Open Assets</UButton>
          <UButton icon="i-lucide-workflow" variant="ghost" class="w-full justify-start">Discover Workflows</UButton>
          <UButton icon="i-lucide-plus" variant="ghost" class="w-full justify-start" @click="handleNewSession">New Session</UButton>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">History</h3>
          <div class="space-y-1 text-sm text-gray-500">
            <div>Course Outline – Productivity...</div>
            <div>Resume Summary – Marketin...</div>
            <div>Video Script – AI Trends 2025</div>
            <div>Email Draft – Client Follow-up</div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 bg-green-300 rounded"></div>
          <div>
            <div class="text-sm font-medium text-gray-900">Intelligent</div>
            <div class="text-xs text-gray-500">Free</div>
          </div>
        </div>
        <UButton class="w-full bg-green-500 hover:bg-green-600 text-white">Upgrade</UButton>
      </div>
    </div>

    <!-- Main Chat Panel -->
    <div class="flex-1 flex flex-col">
      <!-- Top bar -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 class="text-lg font-semibold">Dynamic Sneaker Showcase</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-yellow-400 rounded-full"></div>
            <span class="text-sm font-medium">1000 points</span>
          </div>
          <UButton icon="i-lucide-more-vertical" variant="ghost" size="sm" />
        </div>
      </div>

      <!-- Scrollable chat area that fits the viewport -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <div class="h-full max-w-3xl mx-auto flex flex-col gap-2 px-4">
          <!-- This is the actual scroller -->
          <div class="flex-1 min-h-0 overflow-y-auto">
            <ClientOnly>
              <UChatMessages
                v-if="messages.length"
                :messages="messages"
                auto-scroll-icon="i-lucide-chevron-down"
                :should-scroll-to-bottom="true"
                class="min-h-full"
              >
                <template #content="{ message }">
                  <div class="prose prose-sm max-w-none">
                    <span class="whitespace-pre-wrap">{{ message.content }}</span>
                  </div>
                </template>
              </UChatMessages>

              <div v-if="isLoading" class="flex items-center gap-2 p-4 text-gray-500">
                <UIcon name="i-lucide-loader-2" class="animate-spin" />
                <span>AI is thinking...</span>
              </div>

              <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded-lg m-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-alert-circle" />
                  <span>{{ error }}</span>
                </div>
              </div>

              <template #placeholder>
                <div class="h-full flex items-center justify-center text-gray-400">
                  Loading…
                </div>
              </template>
            </ClientOnly>
          </div>

          <div>
            <UChatPrompt 
              v-model="input" 
              @submit="handleSend"
              :disabled="isLoading"
              placeholder="Type your message here..."
            >
              <UChatPromptSubmit :disabled="isLoading" />
            </UChatPrompt>
            
            <!-- Streaming toggle -->
            <div class="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
              <UCheckbox v-model="useStreaming" label="Stream responses" />
            </div>
          </div>

          <!-- Suggested Prompts (two columns, horizontal separators only) -->
          <div v-if="messages.length <= 1" class="space-y-2">
            <div class="grid grid-cols-2">
              <button 
                class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Create an outline for a course on productivity skills')"
                :disabled="isLoading"
              >
                Outline course on productivity skills
              </button>
              <button 
                class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Write a script outline on 2025 AI trends')"
                :disabled="isLoading"
              >
                Script outline on 2025 AI trends
              </button>
            </div>
            <div class="border-t border-gray-200 grid grid-cols-2">
              <button 
                class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Summarize my resume for a marketing job application')"
                :disabled="isLoading"
              >
                Summarize resume for marketing job
              </button>
              <button 
                class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Write a follow-up email to a client who has gone silent')"
                :disabled="isLoading"
              >
                Follow-up email to silent client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'studio' })
import { ref, onMounted } from 'vue'
import { useAI } from '~/composables/useAI'

const { messages, isLoading, error, sendMessage, clearMessages } = useAI()
const input = ref('')
const useStreaming = ref(true) // Toggle for streaming vs non-streaming responses

async function handleSend() {
  if (!input.value.trim()) return
  
  const message = input.value
  input.value = ''
  
  // Send message to AI service
  await sendMessage(message, useStreaming.value)
}

function handleNewSession() {
  clearMessages()
}

function handleSuggestedPrompt(prompt: string) {
  input.value = prompt
  handleSend()
}

// Initialize with a welcome message
onMounted(() => {
  if (messages.value.length === 0) {
    messages.value.push({
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      created: Math.floor(Date.now() / 1000)
    })
  }
})
</script>
