<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-60 bg-gray-50 border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 pb-0 border-gray-200">
        <div class="flex justify-between items-center gap-3">
          <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" />
          <UButton icon="i-lucide-panel-left" variant="ghost" size="sm" />
        </div>
      </div>

      <!-- Navigation + History (scrollable area) -->
      <div class="flex-1 flex flex-col min-h-0 p-4 space-y-4">
        <!-- Static Navigation -->
        <div class="space-y-2 shrink-0">
          <UButton icon="i-lucide-home" variant="ghost" size="xs" class="w-full justify-start gap-x-2 text-black"
            @click="navigateTo('/')">
            <p class="text-xs">Go to Dashboard</p>
          </UButton>
          <UButton icon="i-lucide-folder" variant="ghost" size="xs" class="w-full justify-start gap-x-2 text-black">
            <p class="text-xs">Open Assets</p>
          </UButton>
          <UButton icon="i-lucide-git-branch" variant="ghost" size="xs" class="w-full justify-start gap-x-2 text-black">
            <p class="text-xs">Discover Workflows</p>
          </UButton>
          <UButton icon="i-lucide-pencil" variant="ghost" size="xs" class="w-full justify-start gap-x-2 text-black"
            @click="handleNewSession">
            <p class="text-xs">New Session</p>
          </UButton>
        </div>

        <!-- History (scrollable) -->
        <div class="flex-1 min-h-0 overflow-y-auto">
          <h3 class="text-sm mb-3 text-black">History</h3>
          <div class="space-y-1 text-xs">
            <div v-for="chat in chats" :key="chat.id">
              <UButton variant="ghost" size="xs" class="w-full justify-start gap-x-2" @click="handleLoadChat(chat)">
                <UIcon name="i-lucide-message-circle" class="shrink-0 w-4 h-4 text-black" />
                <span class="truncate text-xs text-black">{{ chat.title || 'New Chat' }}</span>
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom section (fixed) -->
      <div class="p-4 border-t border-gray-200 shrink-0">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-6 h-6 bg-green-300 rounded"></div>
          <div>
            <div class="text-sm font-medium text-gray-900">Intelligent</div>
            <div class="text-xs text-gray-500">Free</div>
          </div>
        </div>
        <UButton class="w-full py-3 bg-green-600 hover:bg-green-600 justify-center text-white">Upgrade</UButton>
      </div>
    </div>

    <!-- Main Chat Panel -->
    <div class="flex-1 flex flex-col">
      <!-- Top bar -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 class="text-lg font-semibold text-black">{{ chatTitle }}</h1>
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
          <div ref="chatContainer"  class="flex-1 min-h-0 overflow-y-auto">
            <ClientOnly>
              <UChatMessages v-if="messages.length" :messages="messages" auto-scroll-icon="i-lucide-chevron-down"
                class="min-h-full" should-auto-scroll :auto-scroll="false" :user="{ variant: 'solid'}" :assistant="{ variant: 'solid' }">
                <template #content="{ message }">
                  <div class="prose prose-sm max-w-none bg-white rounded-lg"
                    :class="message.role === 'user' ? 'bg-white text-black' : 'bg-white text-gray-900'">

                    <!-- If this is an assistant message AND loading is in progress, show the AI thinking loader -->
                    <div v-if="message.role === 'assistant' && isLoading" class="flex items-center gap-2 text-gray-500">
                      <UIcon name="i-lucide-loader-2" class="animate-spin" />
                      <span>AI is thinking...</span>
                    </div>

                    <!-- Otherwise render the message content -->
                    <div v-else v-html="renderMarkdown(message.content)"></div>
                  </div>
                </template>
              </UChatMessages>

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
            <div class="flex justify-center mb-2">
              <button v-if="messages.length && !isAtBottom" @click="scrollToBottom()"
                class="flex items-center bg-white border border-gray-300 hover:bg-gray-300 text-gray-700 p-2 pb-1 rounded-full shadow-md">
                <UIcon name="i-lucide-chevron-down" class="w-5 h-5" />
              </button>
            </div>

            <div class="flex items-center rounded-2xl shadow-sm">
              <!-- Input Box -->
              <div class="flex flex-col w-full bg-white rounded-xl shadow p-4">

                <!-- Multiline Textarea -->
                <textarea v-model="input" :disabled="isLoading" placeholder="Describe your idea"
                  class="w-full resize-none outline-none text-gray-700 text-sm placeholder-gray-600 h-20"
                  @keyup.enter.exact.prevent="handleSend"></textarea>

                <!-- Actions -->
                <div class="w-full flex justify-between items-center mt-2">
                  <!-- Left plus button -->
                  <button class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">
                    <span class="text-2xl text-gray-500">+</span>
                  </button>

                  <!-- Right submit button -->
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-700 text-xs">New Message</span>
                    <button @click="handleSend" :disabled="isLoading"
                      class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                      <UIcon name="i-lucide-arrow-up" class="text-gray-500" size="2xl" />
                    </button>
                  </div>
                </div>

              </div>
            </div>


            <!-- Streaming toggle -->
            <div class="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
              <UCheckbox v-model="useStreaming" label="Stream responses" />
            </div>
          </div>

          <!-- Suggested Prompts (two columns, horizontal separators only) -->
          <div v-if="messages.length <= 1" class="space-y-2">
            <div class="grid grid-cols-2">
              <button class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Create an outline for a course on productivity skills')"
                :disabled="isLoading">
                Outline course on productivity skills
              </button>
              <button class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Write a script outline on 2025 AI trends')" :disabled="isLoading">
                Script outline on 2025 AI trends
              </button>
            </div>
            <div class="border-t border-gray-200 grid grid-cols-2">
              <button class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Summarize my resume for a marketing job application')"
                :disabled="isLoading">
                Summarize resume for marketing job
              </button>
              <button class="text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                @click="handleSuggestedPrompt('Write a follow-up email to a client who has gone silent')"
                :disabled="isLoading">
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
import { user } from '#build/ui-pro';
import { ref, onMounted } from 'vue'
import { useAI } from '~/composables/useAI'
const isAtBottom = ref(true)
const chatTitle = ref('New Chat');
const { chats, messages, isLoading, error, sendMessage, clearMessages, getHistory, loadChat } = useAI()
const input = ref('')
const useStreaming = ref(true) // Toggle for streaming vs non-streaming responses

async function handleSend() {
  if (!input.value.trim()) return

  const message = input.value
  input.value = ''

  await sendMessage(message, useStreaming.value)
  await getHistory(); // Refresh chat history after sending a message
}

function handleNewSession() {
  clearMessages()
  chatTitle.value = 'New Chat';
}

const chatContainer = ref<HTMLElement | null>(null)

function scrollToBottom(smooth = true) {
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
    isAtBottom.value = true
  }
}
function handleScroll() {
  if (!chatContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  // If user is within 50px of bottom → considered "at bottom"
  isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 50
}
async function handleLoadChat(chat: { id: string, title: string }) {
  await loadChat(chat.id)
  chatTitle.value = chat.title || '';
}

function handleSuggestedPrompt(prompt: string) {
  input.value = prompt
  handleSend()
}

// Initialize with a welcome message
onMounted(() => {
  getHistory();
  if (chatContainer.value) {
    chatContainer.value.addEventListener('scroll', handleScroll)
  }
})
</script>
<style scoped>
.chat {
  background-color: white;
}
/* Apply to all scrollable elements */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
  /* optional */
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
  /* gray thumb */
  border-radius: 9999px;
  /* fully rounded */
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) transparent;
}
</style>