import type { ApiResponse, ApiError, PaginatedResponse } from "~/types";
import { HttpStatusCode } from "~/types";
import { v4 as uuidv4 } from 'uuid';

/**
 * 生成请求ID
 */
const generateRequestId = (): string => {
  return uuidv4().substring(0, 8);
};

/**
 * 获取当前时间戳
 */
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * 记录响应日志
 */
const logResponse = (type: 'success' | 'error', code: number, message: string, requestId?: string) => {
  const timestamp = getCurrentTimestamp();
  const logData = {
    type,
    code,
    message,
    requestId,
    timestamp
  };
  
  if (type === 'error') {
    console.error('[API Error]', logData);
  } else {
    console.log('[API Success]', logData);
  }
};

/**
 * 统一成功响应格式
 * @param data 响应数据
 * @param message 响应消息
 * @param code HTTP状态码
 * @param requestId 请求ID
 */
export const successResponse = <T>(
  data?: T,
  message: string = "操作成功",
  code: number = HttpStatusCode.OK,
  requestId?: string
): ApiResponse<T> => {
  const id = requestId || generateRequestId();
  const timestamp = getCurrentTimestamp();
  
  const response: ApiResponse<T> = {
    code,
    data,
    message,
    timestamp,
    requestId: id,
  };

  logResponse('success', code, message, id);
  return response;
};

/**
 * 统一错误响应格式
 * @param message 错误消息
 * @param code HTTP状态码
 * @param errors 错误详情数组
 * @param requestId 请求ID
 */
export const errorResponse = (
  message: string = "操作失败",
  code: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
  errors?: ApiError[],
  requestId?: string
): ApiResponse => {
  const id = requestId || generateRequestId();
  const timestamp = getCurrentTimestamp();
  
  const response: ApiResponse = {
    code,
    message,
    errors,
    timestamp,
    requestId: id,
  };

  logResponse('error', code, message, id);
  return response;
};

/**
 * 分页数据响应格式
 * @param items 数据项
 * @param total 总数
 * @param page 当前页
 * @param pageSize 每页大小
 * @param message 响应消息
 * @param requestId 请求ID
 */
export const paginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = "获取数据成功",
  requestId?: string
): ApiResponse<PaginatedResponse<T>> => {
  const totalPages = Math.ceil(total / pageSize);
  
  const paginatedData: PaginatedResponse<T> = {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };

  return successResponse(paginatedData, message, HttpStatusCode.OK, requestId);
};

/**
 * 创建成功响应 (201)
 */
export const createdResponse = <T>(
  data?: T,
  message: string = "创建成功",
  requestId?: string
): ApiResponse<T> => {
  return successResponse(data, message, HttpStatusCode.CREATED, requestId);
};

/**
 * 无内容响应 (204)
 */
export const noContentResponse = (
  message: string = "操作成功",
  requestId?: string
): ApiResponse => {
  return successResponse(undefined, message, HttpStatusCode.NO_CONTENT, requestId);
};

/**
 * 客户端错误响应 (400)
 */
export const badRequestResponse = (
  message: string = "请求参数错误",
  errors?: ApiError[],
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.BAD_REQUEST, errors, requestId);
};

/**
 * 未授权响应 (401)
 */
export const unauthorizedResponse = (
  message: string = "未授权访问",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.UNAUTHORIZED, undefined, requestId);
};

/**
 * 禁止访问响应 (403)
 */
export const forbiddenResponse = (
  message: string = "禁止访问",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.FORBIDDEN, undefined, requestId);
};

/**
 * 资源未找到响应 (404)
 */
export const notFoundResponse = (
  message: string = "资源未找到",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.NOT_FOUND, undefined, requestId);
};

/**
 * 方法不允许响应 (405)
 */
export const methodNotAllowedResponse = (
  message: string = "方法不允许",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.METHOD_NOT_ALLOWED, undefined, requestId);
};

/**
 * 冲突响应 (409)
 */
export const conflictResponse = (
  message: string = "资源冲突",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.CONFLICT, undefined, requestId);
};

/**
 * 验证错误响应 (422)
 */
export const validationErrorResponse = (
  message: string = "数据验证失败",
  errors?: ApiError[],
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.UNPROCESSABLE_ENTITY, errors, requestId);
};

/**
 * 请求过多响应 (429)
 */
export const tooManyRequestsResponse = (
  message: string = "请求过于频繁",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.TOO_MANY_REQUESTS, undefined, requestId);
};

/**
 * 服务器内部错误响应 (500)
 */
export const internalServerErrorResponse = (
  message: string = "服务器内部错误",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.INTERNAL_SERVER_ERROR, undefined, requestId);
};

/**
 * 服务不可用响应 (503)
 */
export const serviceUnavailableResponse = (
  message: string = "服务暂不可用",
  requestId?: string
): ApiResponse => {
  return errorResponse(message, HttpStatusCode.SERVICE_UNAVAILABLE, undefined, requestId);
};

/**
 * 从错误对象创建响应
 * @param error 错误对象
 * @param requestId 请求ID
 */
export const fromError = (
  error: Error | any,
  requestId?: string
): ApiResponse => {
  let message = "未知错误";
  let code = HttpStatusCode.INTERNAL_SERVER_ERROR;
  let errors: ApiError[] | undefined;

  if (error instanceof Error) {
    message = error.message;
    
    // 根据错误类型设置不同的状态码
    if (error.name === 'ValidationError') {
      code = HttpStatusCode.UNPROCESSABLE_ENTITY;
    } else if (error.name === 'UnauthorizedError') {
      code = HttpStatusCode.UNAUTHORIZED;
    } else if (error.name === 'ForbiddenError') {
      code = HttpStatusCode.FORBIDDEN;
    } else if (error.name === 'NotFoundError') {
      code = HttpStatusCode.NOT_FOUND;
    }
  } else if (typeof error === 'object' && error !== null) {
    message = error.message || message;
    code = error.code || code;
    errors = error.errors;
  }

  return errorResponse(message, code, errors, requestId);
};

/**
 * 响应工具类
 */
export class ResponseHelper {
  private requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || generateRequestId();
  }

  success<T>(data?: T, message?: string, code?: number) {
    return successResponse(data, message, code, this.requestId);
  }

  error(message?: string, code?: number, errors?: ApiError[]) {
    return errorResponse(message, code, errors, this.requestId);
  }

  paginated<T>(items: T[], total: number, page: number, pageSize: number, message?: string) {
    return paginatedResponse(items, total, page, pageSize, message, this.requestId);
  }

  created<T>(data?: T, message?: string) {
    return createdResponse(data, message, this.requestId);
  }

  noContent(message?: string) {
    return noContentResponse(message, this.requestId);
  }

  badRequest(message?: string, errors?: ApiError[]) {
    return badRequestResponse(message, errors, this.requestId);
  }

  unauthorized(message?: string) {
    return unauthorizedResponse(message, this.requestId);
  }

  forbidden(message?: string) {
    return forbiddenResponse(message, this.requestId);
  }

  notFound(message?: string) {
    return notFoundResponse(message, this.requestId);
  }

  conflict(message?: string) {
    return conflictResponse(message, this.requestId);
  }

  validationError(message?: string, errors?: ApiError[]) {
    return validationErrorResponse(message, errors, this.requestId);
  }

  tooManyRequests(message?: string) {
    return tooManyRequestsResponse(message, this.requestId);
  }

  internalServerError(message?: string) {
    return internalServerErrorResponse(message, this.requestId);
  }

  serviceUnavailable(message?: string) {
    return serviceUnavailableResponse(message, this.requestId);
  }

  fromError(error: Error | any) {
    return fromError(error, this.requestId);
  }
}
