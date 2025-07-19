// https://nuxt.com/docs/api/configuration/nuxt-config
import { appConfig } from './config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
  ],
  
  css: [
    'tdesign-vue-next/es/style/index.css',
    '~/assets/css/style.css'
  ],
  
  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: false // 暂时禁用以避免启动问题
  },
  
  // 运行时配置
  runtimeConfig: {
    // 服务端环境变量
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || appConfig.ollama.baseUrl,
    ollamaModel: process.env.OLLAMA_MODEL || appConfig.ollama.model,
    
    // 客户端环境变量
    public: {
      appName: appConfig.name,
      version: appConfig.version
    }
  },
  
  // 服务端渲染配置
  ssr: true,
  
  // 头部配置
  app: {
    head: {
      title: appConfig.name,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appConfig.description }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  // 开发服务器配置
  devServer: {
    port: 3000,
    host: 'localhost'
  }
})
