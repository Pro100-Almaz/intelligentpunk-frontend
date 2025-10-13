import { ref, computed } from 'vue'
import { useRuntimeConfig, useCookie } from '#app'
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created?: number
}

export interface ChatRequest {
  model: string
  role: string
  content: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
  provider?: string
  instrument?: string
  message_type?: string
  conversation_id?: string
}

export const useAI = () => {
  const token = useCookie<string | null>('auth-token').value
  const config = useRuntimeConfig()
  const messages = ref<ChatMessage[]>([])
  const chats = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentStreamingMessage = ref<string>('')
  const currentConversationId = ref<string | null>(null)

  // Use configuration for the response-generator service
  const apiBase = config.public.aiApiBase

  const getModels = async (): Promise<string[]> => {
    try {
      const response = await fetch(`${apiBase}/chat/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'local-dev-key-123',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.models || []
    } catch (err: any) {
      console.error('AI API Models Error:', err)
      error.value = err.message || 'Failed to fetch models'
      return []
    }
  }
  const createConversation = async (userId: number, title: string): Promise<string | null> => {
    try {
      const response = await fetch(`${apiBase}/chat/conversations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          title: title
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.id || null
    } catch (err: any) {
      console.error('AI API Create Conversation Error:', err)
      error.value = err.message || 'Failed to create conversation'
      return null
    }
  }
  const sendMessage = async (
    content: string,
    stream: boolean = false,
    model: string,
    id: number
  ) => {
    isLoading.value = true
    error.value = null
    currentStreamingMessage.value = ''
  
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created: Math.floor(Date.now() / 1000)
    }
    messages.value.push(userMessage)
  
    const normalizedModel = model.split('/').pop() || model
  
    const requestBody: ChatRequest = {
      model: normalizedModel,
      content,
      role: 'user',
      temperature: 0.3,
      provider: 'openai',
      instrument: 'chat',
      message_type: 'text',
      max_tokens: 2000,
      stream,
      conversation_id: currentConversationId.value || undefined
    }
  
    const cleanupOnError = () => {
      const maybeAssistantIndex = messages.value.findIndex(
        m => m.role === 'assistant' && m.content === ''
      )
      if (maybeAssistantIndex !== -1) messages.value.splice(maybeAssistantIndex, 1)
      const idx = messages.value.findIndex(m => m.id === userMessage.id)
      if (idx !== -1) messages.value.splice(idx, 1)
    }
  
    try {
      const response = await fetch(`${apiBase}/chat/conversations/${id}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
  
      // ✅ Case 1: Normal JSON (non-streaming)
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json()
  
        // Example from your backend:
        // { user_message: {...}, assistant_message: {...} }

        if (data.assistant_message) {
          const msg = data.assistant_message
          messages.value.push({
            id: msg.id,
            role: 'assistant',
            content: msg.content,
            created: Math.floor(new Date(msg.created_at).getTime() / 1000)
          })
        }
  
        if (!currentConversationId.value && data.assistant_message?.conversation_id) {
          currentConversationId.value = data.assistant_message.conversation_id
        }
  
        isLoading.value = false
        return
      }
  
      // ✅ Case 2: Streaming response
      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.status}`)
      }
  
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: '',
        created: Math.floor(Date.now() / 1000)
      }
      messages.value.push(assistantMessage)
      const assistantIndex = messages.value.length - 1
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let finished = false
  
      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
  
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
  
        for (const part of parts) {
          if (!part.startsWith('data:')) continue
          const jsonStr = part.slice(5).trim()
          if (!jsonStr) continue
  
          if (jsonStr === '[DONE]') {
            finished = true
            break
          }
  
          try {
            const chunk = JSON.parse(jsonStr)
            if (!currentConversationId.value && chunk.conversation_id) {
              currentConversationId.value = chunk.conversation_id
            }
  
            const delta = chunk.delta ?? chunk.content ?? ''
            if (!delta) continue
  
            const old = messages.value[assistantIndex]
            const newMsg = { ...old, content: old.content + delta }
            messages.value.splice(assistantIndex, 1, newMsg)
            currentStreamingMessage.value += delta
          } catch (e) {
            console.warn('Stream parse error:', e)
          }
        }
      }
  
    } catch (err: any) {
      console.error('AI API Error:', err)
      error.value = err?.message || 'Failed to get response from AI'
      cleanupOnError()
    } finally {
      isLoading.value = false
      currentStreamingMessage.value = ''
    }
  }
  

  const sendMessageStream = async (content: string, stream: boolean = false, model: string, id: number) => {
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
    const userIndex = messages.value.length - 1
    const normalizedModel = model.split('/').pop() || model

    const requestBody: ChatRequest = {
      model: normalizedModel,
      content: content,
      role: 'user',
      temperature: 0.3,
      provider: 'openai',
      instrument: 'chat',
      message_type: 'text',
      max_tokens: 2000,
      stream,
      conversation_id: currentConversationId.value || undefined
    }

    // Helper to remove both user and assistant placeholders if needed
    const cleanupOnError = () => {
      // remove assistant placeholder if present (it's pushed after user)
      const maybeAssistantIndex = messages.value.findIndex(m => m.role === 'assistant' && m.content === '')
      if (maybeAssistantIndex !== -1) messages.value.splice(maybeAssistantIndex, 1)
      // remove user message if it is still the last one
      const idx = messages.value.findIndex(m => m.id === userMessage.id)
      if (idx !== -1) messages.value.splice(idx, 1)
    }

    try {
      if (stream) {

        const response = await fetch(`${apiBase}/chat/conversations/${id}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID(),
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok || !response.body) {
          throw new Error(`API error: ${response.status}`)
        }

        // Assistant placeholder (empty content) — we will REPLACE this object as chunks arrive
        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: '',
          created: Math.floor(Date.now() / 1000)
        }
        messages.value.push(assistantMessage)
        const assistantIndex = messages.value.length - 1

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let finished = false

        while (!finished) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // SSE-like frames separated by double newline
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            if (!part.startsWith('data:')) continue
            const jsonStr = part.slice(5).trim()
            if (!jsonStr) continue

            if (jsonStr === '[DONE]') {
              finished = true
              break
            }

            try {
              const chunk = JSON.parse(jsonStr)
              if (!currentConversationId.value && chunk.conversation_id) {
                currentConversationId.value = chunk.conversation_id
              }

              // Accept delta or content field (be defensive)
              const delta = (chunk.delta ?? chunk.content ?? '')
              if (!delta) continue

              // Replace the assistant message object so Vue and child components notice the change
              const old = messages.value[assistantIndex] ?? { ...assistantMessage }
              const newMsg = { ...old, content: old.content + delta }
              messages.value.splice(assistantIndex, 1, newMsg)

              // keep a small streaming buffer if you want to show it separately
              currentStreamingMessage.value += delta
            } catch (e) {
              console.warn('Stream parse error:', e)
            }
          }
        }

        // Make sure we mark as finished — optionally set metadata if provided in last chunk
        isLoading.value = false
      } else {
        // Non-streaming request
        const response = await fetch(`${apiBase}/messages/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID()
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) throw new Error(`API error: ${response.status}`)

        const data = await response.json()
        if (!currentConversationId.value && data.conversation_id) {
          currentConversationId.value = data.conversation_id
        }

        const assistantMessage: ChatMessage = {
          id: data.id || Date.now().toString(),
          role: 'assistant',
          content: data.content || '',
          created: data.created || Math.floor(Date.now() / 1000)
        }
        messages.value.push(assistantMessage)
      }
    } catch (err: any) {
      console.error('AI API Error:', err)
      error.value = err?.message || 'Failed to get response from AI'
      cleanupOnError()
    } finally {
      // always ensure these are cleared (defensive)
      isLoading.value = false
      currentStreamingMessage.value = ''
    }
  }


  // Fetch list of conversations


  const getHistory = async () => {
    try {
      const response = await fetch(`${apiBase}/chat/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    currentConversationId.value = null
  }

  const removeMessage = (id: string) => {
    messages.value = messages.value.filter(m => m.id !== id)
  }

  const loadChat = async (conversationId: string) => {
    try {
      const response = await fetch(`${apiBase}/chat/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'local-dev-key-123',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Clear current messages and set the conversation ID
      messages.value = []
      currentConversationId.value = conversationId

      // Load messages from the conversation
      if (data.messages && data.messages.length > 0) {
        messages.value = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          created: Math.floor(new Date(msg.created_at).getTime() / 1000)
        }))
      }

    } catch (err: any) {
      console.error('AI API Load Chat Error:', err)
      error.value = err.message || 'Failed to load chat'
    }
  }

  return {
    messages: computed(() => messages.value),
    chats: computed(() => chats.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentStreamingMessage: computed(() => currentStreamingMessage.value),
    currentConversationId: computed(() => currentConversationId.value),
    sendMessage,
    getModels,
    clearMessages,
    removeMessage,
    getHistory,
    loadChat,
    createConversation,
  }
}
