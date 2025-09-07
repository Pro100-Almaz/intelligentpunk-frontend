import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'


export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created?: number
}

export interface ChatRequest {
  model: string
  messages: Array<{
    role: string
    content: string
  }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export const useAI = () => {
  const config = useRuntimeConfig()
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentStreamingMessage = ref<string>('')

  // Use configuration for the response-generator service
  const apiBase = config.public.aiApiBase

  const sendMessage = async (content: string, stream: boolean = false) => {
    isLoading.value = true
    error.value = null
    currentStreamingMessage.value = ''

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      created: Math.floor(Date.now() / 1000)
    }
    messages.value.push(userMessage)

    const requestBody: ChatRequest = {
      model: 'openai:gpt-4o-mini',
      messages: messages.value.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.3,
      max_tokens: 2000,
      stream: stream
    }

    try {
      if (stream) {
        // Handle streaming response
        console.log('Sending streaming request to AI API...')
        const response = await fetch(`${apiBase}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        // Create assistant message placeholder
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '',
          created: Math.floor(Date.now() / 1000)
        }
        messages.value.push(assistantMessage)
        const assistantIndex = messages.value.length - 1

        // Read the stream
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  break
                }
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.delta) {
                    const msg = messages.value[assistantIndex]
                    if (msg) {
                      msg.content += parsed.delta
                      currentStreamingMessage.value += parsed.delta
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } else {
        // Handle non-streaming response
        const response = await $fetch(`${apiBase}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: requestBody
        })

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: (response as any).id || Date.now().toString(),
          role: 'assistant',
          content: (response as any).content,
          created: (response as any).created || Math.floor(Date.now() / 1000)
        }
        messages.value.push(assistantMessage)
      }
    } catch (err: any) {
      console.error('AI API Error:', err)
      error.value = err.message || 'Failed to get response from AI'
      
      // Remove the user message if there was an error
      messages.value.pop()
    } finally {
      isLoading.value = false
      currentStreamingMessage.value = ''
    }
  }

  const clearMessages = () => {
    messages.value = []
    error.value = null
  }

  const removeMessage = (id: string) => {
    messages.value = messages.value.filter(m => m.id !== id)
  }

  return {
    messages: computed(() => messages.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentStreamingMessage: computed(() => currentStreamingMessage.value),
    sendMessage,
    clearMessages,
    removeMessage
  }
}
