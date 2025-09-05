<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        @click="closeOnBackdrop"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-white/30 backdrop-blur-md"></div>
        
        <!-- Modal Container -->
        <div
          ref="modalRef"
          class="relative bg-white rounded-lg shadow-xl
                 w-full max-w-4xl max-h-screen flex flex-col overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-2xl font-bold text-blue-600">Help Us Improve</h3>
            <button
              @click="closeModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Tab Navigation -->
            <div class="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <component :is="tab.icon" class="w-4 h-4 mr-2" />
                {{ tab.label }}
              </button>
            </div>

            <!-- Tab Content -->
            <div class="space-y-6">
              <!-- Report Bug Tab -->
              <div v-if="activeTab === 'report-bug'">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 class="text-lg font-semibold text-red-800 mb-2">Report a Bug</h4>
                  <p class="text-red-700">Help us fix issues by providing detailed information about the problem you encountered.</p>
                </div>

                <form @submit.prevent="submitBugReport" class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Bug Title</label>
                    <input
                      v-model="bugForm.title"
                      type="text"
                      placeholder="Brief description of the bug"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                    <textarea
                      v-model="bugForm.description"
                      placeholder="Please describe the bug, steps to reproduce, and expected behavior..."
                      rows="6"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Screenshot (Optional)</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <input
                        type="file"
                        ref="fileInput"
                        @change="handleFileUpload"
                        accept="image/*"
                        class="hidden"
                      />
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600">{{ selectedFile ? selectedFile.name : 'No file chosen' }}</span>
                        <button
                          type="button"
                          @click="$refs.fileInput.click()"
                          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon class="w-4 h-4 mr-2" />
                    {{ isSubmitting ? 'Submitting...' : 'Submit Bug Report' }}
                  </button>
                </form>
              </div>

              <!-- Suggest Tool Tab -->
              <div v-if="activeTab === 'suggest-tool'">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 class="text-lg font-semibold text-yellow-800 mb-2">Suggest a New Tool</h4>
                  <p class="text-yellow-700">Have an idea for a tool that would help you? Let us know and earn points if we implement it!</p>
                </div>

                <form @submit.prevent="submitToolSuggestion" class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tool Name</label>
                    <input
                      v-model="toolForm.name"
                      type="text"
                      placeholder="What would you call this tool?"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      v-model="toolForm.category"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                    >
                      <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      v-model="toolForm.description"
                      placeholder="Describe what this tool would do and how it would help users..."
                      rows="6"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <LightBulbIcon class="w-4 h-4 mr-2" />
                    {{ isSubmitting ? 'Submitting...' : 'Submit Tool Suggestion' }}
                  </button>
                </form>
              </div>

              <!-- Vote on Ideas Tab -->
              <div v-if="activeTab === 'vote-on-ideas'">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 class="text-lg font-semibold text-blue-800 mb-2">Vote on Tool Ideas</h4>
                  <p class="text-blue-700">Help us prioritize which tools to build next by voting on community suggestions.</p>
                </div>

                <div class="mb-6 relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search suggestions..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div class="space-y-4">
                  <div
                    v-for="idea in filteredIdeas"
                    :key="idea.id"
                    class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <h5 class="font-semibold text-gray-900">{{ idea.title }}</h5>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ idea.category }}
                          </span>
                        </div>
                        <p class="text-gray-600 mb-3">{{ idea.description }}</p>
                        <div class="flex items-center text-sm text-gray-500">
                          <ChartBarIcon class="w-4 h-4 mr-1" />
                          {{ idea.votes }} votes
                        </div>
                      </div>
                      <button
                        @click="voteForIdea(idea.id)"
                        :disabled="votedIdeas.includes(idea.id)"
                        :class="[
                          'flex items-center px-4 py-2 rounded-lg border transition-colors',
                          votedIdeas.includes(idea.id)
                            ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed'
                            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                        ]"
                      >
                        <HandThumbUpIcon class="w-4 h-4 mr-2" />
                        {{ votedIdeas.includes(idea.id) ? 'Voted' : 'Vote' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Icon components (using Heroicons)
const BugAntIcon = {
  template: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
}

const LightBulbIcon = {
  template: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`
}

const HandThumbUpIcon = {
  template: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>`
}

const PaperAirplaneIcon = {
  template: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`
}

const MagnifyingGlassIcon = {
  template: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>`
}

const ChartBarIcon = {
  template: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>`
}

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive data
const modalRef = ref(null)
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('suggest-tool')
const isSubmitting = ref(false)
const selectedFile = ref(null)
const searchQuery = ref('')
const votedIdeas = ref([])

// Tab configuration
const tabs = [
  {
    key: 'report-bug',
    label: 'Report Bug',
    icon: BugAntIcon
  },
  {
    key: 'suggest-tool',
    label: 'Suggest Tool',
    icon: LightBulbIcon
  },
  {
    key: 'vote-on-ideas',
    label: 'Vote on Ideas',
    icon: HandThumbUpIcon
  }
]

// Form data
const bugForm = ref({
  title: '',
  description: ''
})

const toolForm = ref({
  name: '',
  category: 'General',
  description: ''
})

// Categories for tool suggestions
const categories = [
  'General',
  'Productivity',
  'Design',
  'Development',
  'Marketing',
  'Analytics',
  'Communication'
]

// Sample ideas for voting
const ideas = ref([
  {
    id: 1,
    title: 'PDF to Word Converter',
    category: 'productivity',
    description: 'A tool that can convert PDF documents to editable Word documents while preserving formatting',
    votes: 15
  },
  {
    id: 2,
    title: 'Image Background Remover',
    category: 'design',
    description: 'Automatically remove backgrounds from images using AI technology',
    votes: 23
  },
  {
    id: 3,
    title: 'QR Code Generator',
    category: 'general',
    description: 'Generate custom QR codes for URLs, text, and contact information',
    votes: 8
  }
])

// Computed
const filteredIdeas = computed(() => {
  if (!searchQuery.value) return ideas.value
  return ideas.value.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const closeModal = () => {
  isOpen.value = false
}

const closeOnBackdrop = (event) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const submitBugReport = async () => {
  isSubmitting.value = true
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData()
    formData.append('title', bugForm.value.title)
    formData.append('description', bugForm.value.description)
    
    // Add screenshot if selected
    if (selectedFile.value) {
      formData.append('screenshot', selectedFile.value)
    }
    
    // Get the base URL from Nuxt config or use default
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase

    console.log(authStore.token)
    
    // Send request to API with auth token
    const response = await $fetch(`${baseURL}/api/feedback/bugs/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    // Reset form
    bugForm.value = { title: '', description: '' }
    selectedFile.value = null
    
    // Show success message
    alert('Bug report submitted successfully!')
    
    // Close modal
    closeModal()
  } catch (error) {
    console.error('Error submitting bug report:', error)
    alert('Error submitting bug report. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const submitToolSuggestion = async () => {
  isSubmitting.value = true
  try {
    // Check authentication
    const { requireAuth } = useAuthGuard()
    if (!requireAuth('submit tool suggestions')) {
      closeModal()
      return
    }
    
    // Get auth token
    const authStore = useAuthStore()
    
    // Get the base URL from Nuxt config or use default
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase
    
    // Send request to API with auth token
    const response = await $fetch(`${baseURL}/api/feedback/tools/`, {
      method: 'POST',
      body: {
        name: toolForm.value.name,
        category: toolForm.value.category,
        description: toolForm.value.description
      },
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    // Reset form
    toolForm.value = { name: '', category: 'General', description: '' }
    
    // Show success message
    alert('Tool suggestion submitted successfully!')
    
    // Close modal
    closeModal()
  } catch (error) {
    console.error('Error submitting tool suggestion:', error)
    alert('Error submitting tool suggestion. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const voteForIdea = async (ideaId) => {
  if (!votedIdeas.value.includes(ideaId)) {
    try {
      // Check authentication
      const { requireAuth } = useAuthGuard()
      if (!requireAuth('vote for ideas')) {
        return
      }
      
      // Get auth token
      const authStore = useAuthStore()
      
      // Get the base URL from Nuxt config or use default
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase || 'http://127.0.0.1:8000'
      
      // Send vote to API with auth token
      await $fetch(`${baseURL}/api/feedback/ideas/${ideaId}/vote/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Update local state
      votedIdeas.value.push(ideaId)
      const idea = ideas.value.find(i => i.id === ideaId)
      if (idea) {
        idea.votes++
      }
    } catch (error) {
      console.error('Error voting for idea:', error)
      alert('Error voting for idea. Please try again.')
    }
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>