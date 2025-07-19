// 系统相关类型定义

// API 响应基础类型
export interface ApiResponse<T = any> {
  code: number
  data?: T
  message: string
  errors?: any[]
  timestamp?: string
  requestId?: string
}

// API 错误详情类型
export interface ApiError {
  field?: string
  message: string
  code?: string
}

// 分页响应类型
export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// HTTP 状态码枚举
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// Ollama 配置类型
export interface OllamaConfig {
  baseUrl: string
  model: string
  temperature?: number
}
