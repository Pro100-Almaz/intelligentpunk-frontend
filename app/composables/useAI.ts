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
  const chats = ref<any[]>([])
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
      content,
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
      stream
    }
  
    try {
      if (stream) {
        const response = await fetch(`${apiBase}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'local-dev-key-123',
            'Idempotency-Key': crypto.randomUUID()
          },
          body: JSON.stringify(requestBody)
        })
  
        if (!response.ok || !response.body) {
          throw new Error(`API error: ${response.status}`)
        }
  
        // Assistant placeholder
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '',
          created: Math.floor(Date.now() / 1000)
        }
        messages.value.push(assistantMessage)
        const assistantIndex = messages.value.length - 1
  
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
  
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
  
          // Split by double newlines (SSE frames)
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
  
          for (const part of parts) {
            if (!part.startsWith('data:')) continue
            const jsonStr = part.slice(5).trim()
  
            if (jsonStr === '[DONE]') {
              return // stop reading
            }
  
            try {
              const chunk = JSON.parse(jsonStr)
              if (chunk.delta) {
                const msg = messages.value[assistantIndex]
                if (msg) {
                  msg.content += chunk.delta
                }
                currentStreamingMessage.value += chunk.delta
              }
            } catch (e) {
              console.warn('Stream parse error:', e)
            }
          }
        }
      } else {
        // Non-stream request
        const response = await fetch(`${apiBase}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'local-dev-key-123',
            'Idempotency-Key': crypto.randomUUID()
          },
          body: JSON.stringify(requestBody)
        })
  
        if (!response.ok) throw new Error(`API error: ${response.status}`)
  
        const data = await response.json()
  
        const assistantMessage: ChatMessage = {
          id: data.id || Date.now().toString(),
          role: 'assistant',
          content: data.content,
          created: data.created || Math.floor(Date.now() / 1000)
        }
        messages.value.push(assistantMessage)
      }
    } catch (err: any) {
      console.error('AI API Error:', err)
      error.value = err.message || 'Failed to get response from AI'
      messages.value.pop() // remove user msg if failed
    } finally {
      isLoading.value = false
      currentStreamingMessage.value = ''
    }
  }
  
  const getHistory = async () => {
    try {
      const response = await fetch(`${apiBase}/conversations/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'local-dev-key-123'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      chats.value = data || []
    } catch (err: any) {
      console.error('AI API History Error:', err)
      error.value = err.message || 'Failed to fetch message history'
    }
  }
  // Fetch history on initialization
  const clearMessages = () => {
    messages.value = []
    error.value = null
  }

  const removeMessage = (id: string) => {
    messages.value = messages.value.filter(m => m.id !== id)
  }

  return {
    messages: computed(() => messages.value),
    chats: computed(() => chats.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentStreamingMessage: computed(() => currentStreamingMessage.value),
    sendMessage,
    clearMessages,
    removeMessage,
    getHistory
  }
}
