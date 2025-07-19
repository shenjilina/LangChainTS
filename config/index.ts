// 应用配置
export const appConfig = {
  name: 'LangChain Chat Assistant',
  version: '1.0.0',
  description: '基于 LangChain 和 Ollama 的智能聊天助手',
  
  // Ollama 配置
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen',
    temperature: 0.7,
    maxTokens: 2048,
  },
  
  // UI 配置
  ui: {
    theme: 'light',
    primaryColor: '#409EFF',
    maxMessageLength: 1000,
    chatHistoryLimit: 100,
  },
  
  // API 配置
  api: {
    timeout: 30000, // 30秒超时
    retryAttempts: 3,
    retryDelay: 1000, // 1秒重试延迟
  }
}

// 开发环境配置
export const devConfig = {
  debug: true,
  logLevel: 'debug',
  mockApi: false,
}

// 生产环境配置
export const prodConfig = {
  debug: false,
  logLevel: 'error',
  mockApi: false,
}

// 根据环境获取配置
export const getConfig = () => {
  const baseConfig = appConfig
  
  if (process.env.NODE_ENV === 'development') {
    return { ...baseConfig, ...devConfig }
  }
  
  return { ...baseConfig, ...prodConfig }
}