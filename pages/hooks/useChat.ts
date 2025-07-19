import type { Message, ApiResponse, ChatRequest, ChatResponse } from '~/types'

export const useChat = () => {
  const messages = ref<Message[]>([])
  const isLoading = ref<boolean>(false)
  const isStreaming = ref<boolean>(false)
  const error = ref<string | null>(null)
  const streamingMessageId = ref<string | null>(null)

  const addMessage = (content: string, type: 'user' | 'assistant', id?: string) => {
    const message: Message = {
      id: id || Date.now().toString(),
      content,
      type,
      timestamp: new Date()
    }
    messages.value.unshift(message)
    return message.id
  }

  const updateMessage = (id: string, content: string) => {
    const messageIndex = messages.value.findIndex(msg => msg.id === id)
    if (messageIndex !== -1) {
      messages.value[messageIndex].content = content
    }
  }

  const sendMessage = async (content: string, useStreaming: boolean = true) => {
    if (!content.trim()) {
      throw new Error('消息内容不能为空')
    }

    // 添加用户消息
    addMessage(content, 'user')
    isLoading.value = true
    error.value = null

    try {
      if (useStreaming) {
        await sendStreamingMessage(content)
      } else {
        await sendRegularMessage(content)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '网络请求失败'
      throw err
    } finally {
      isLoading.value = false
      isStreaming.value = false
      streamingMessageId.value = null
    }
  }

  const sendRegularMessage = async (content: string) => {
    const requestBody: ChatRequest = { comment: content }
    
    const response = await $fetch<ApiResponse<ChatResponse>>("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (response.code === 200) {
      addMessage(response.data.content, 'assistant')
    } else {
      throw new Error(response.message || '请求失败')
    }
  }

  const sendStreamingMessage = async (content: string) => {
    isStreaming.value = true
    
    const requestBody: ChatRequest = { 
      comment: content,
      streaming: true 
    }

    try {
      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      // 创建一个空的助手消息用于流式更新
      const assistantMessageId = addMessage('', 'assistant')
      streamingMessageId.value = assistantMessageId
      let fullContent = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              
              switch (data.type) {
                case 'chunk':
                  fullContent = data.fullContent || (fullContent + data.content)
                  updateMessage(assistantMessageId, fullContent)
                  break
                  
                case 'complete':
                  fullContent = data.content
                  updateMessage(assistantMessageId, fullContent)
                  console.log('流式响应完成:', data.metadata)
                  break
                  
                case 'error':
                  throw new Error(data.error || '流式处理出错')
                  
                default:
                  console.warn('未知的流式数据类型:', data.type)
              }
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError, 'Raw line:', line)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // 确保最终内容不为空
      if (!fullContent.trim()) {
        updateMessage(assistantMessageId, '抱歉，我无法生成回复。')
      }

    } catch (fetchError) {
      console.error('流式请求失败:', fetchError)
      
      // 如果流式请求失败，回退到普通请求
      console.log('回退到普通请求模式')
      await sendRegularMessage(content)
    }
  }

  const clearMessages = () => {
    messages.value = []
    streamingMessageId.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const stopStreaming = () => {
    isStreaming.value = false
    streamingMessageId.value = null
  }

  return {
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    isStreaming: readonly(isStreaming),
    error: readonly(error),
    streamingMessageId: readonly(streamingMessageId),
    sendMessage,
    clearMessages,
    clearError,
    stopStreaming
  }
}