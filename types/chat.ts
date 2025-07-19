// 聊天相关类型定义

export interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ChatRequest {
  comment: string
  type?: 'general' | 'translation' | 'code_review' | 'creative_writing' | 'technical_support'
  language?: string
  context?: {
    previousMessages?: Array<{ role: string; content: string }>
    metadata?: Record<string, any>
  }
  streaming?: boolean
}

export interface ChatResponse {
  content: string
  type: string
  timestamp: Date
  metadata?: {
    modelInfo?: Record<string, any>
    processingTime?: number
    detectedType?: string
  }
}

// 聊天会话类型
export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  type?: string
  settings?: {
    language?: string
    autoDetectType?: boolean
    streaming?: boolean
  }
}

// 流式响应类型
export interface StreamResponse {
  chunk: string
  isComplete: boolean
  metadata?: Record<string, any>
}