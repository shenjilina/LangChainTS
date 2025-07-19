import { defineEventHandler, readBody, setHeader } from "h3";
import type { ChatRequest } from "~/types";
import { ResponseHelper } from "~/server/lib/response";
import { langChainService, ChatType } from "~/server/lib/langchain-service";

export default defineEventHandler(async (event) => {
  const response = new ResponseHelper();
  
  try {
    const body = await readBody<ChatRequest>(event);

    // 验证请求参数
    if (!body?.comment?.trim()) {
      return response.badRequest("请求参数不能为空");
    }

    console.log("收到流式聊天请求:", body.comment);

    // 设置流式响应头
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    setHeader(event, 'Cache-Control', 'no-cache');
    setHeader(event, 'Connection', 'keep-alive');
    setHeader(event, 'Access-Control-Allow-Origin', '*');
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type');

    // 确定聊天类型
    let chatType: ChatType;
    if (body.type) {
      chatType = mapRequestTypeToChatType(body.type);
    } else {
      chatType = langChainService.detectChatType(body.comment);
    }

    // 构建聊天上下文
    const chatContext = {
      type: chatType,
      language: body.language,
      previousMessages: body.context?.previousMessages,
      metadata: {
        ...body.context?.metadata,
        requestTime: new Date().toISOString(),
        userAgent: "LangChain Chat Assistant"
      }
    };

    // 创建可写流
    const encoder = new TextEncoder();
    let fullResponse = "";

    // 使用流式处理
    try {
      const result = await langChainService.streamMessage(
        body.comment,
        chatType,
        chatContext,
        (chunk: string) => {
          // 发送流式数据块
          fullResponse += chunk;
          const data = JSON.stringify({
            type: 'chunk',
            content: chunk,
            fullContent: fullResponse,
            timestamp: new Date().toISOString()
          }) + '\n';
          
          // 写入响应流
          event.node.res.write(encoder.encode(data));
        }
      );

      // 发送完成信号
      const completeData = JSON.stringify({
        type: 'complete',
        content: result,
        timestamp: new Date().toISOString(),
        metadata: {
          modelInfo: langChainService.getModelInfo(),
          detectedType: chatType
        }
      }) + '\n';
      
      event.node.res.write(encoder.encode(completeData));
      event.node.res.end();

      console.log("流式响应完成:", result);
    } catch (streamError) {
      console.error("流式处理错误:", streamError);
      
      // 发送错误信息
      const errorData = JSON.stringify({
        type: 'error',
        error: streamError instanceof Error ? streamError.message : '流式处理失败',
        timestamp: new Date().toISOString()
      }) + '\n';
      
      event.node.res.write(encoder.encode(errorData));
      event.node.res.end();
    }

  } catch (error) {
    console.error("Stream Chat API 错误:", error);
    
    // 如果还没有开始流式响应，返回标准错误响应
    if (!event.node.res.headersSent) {
      return response.fromError(error);
    }
    
    // 如果已经开始流式响应，发送错误数据
    const encoder = new TextEncoder();
    const errorData = JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }) + '\n';
    
    event.node.res.write(encoder.encode(errorData));
    event.node.res.end();
  }
});

/**
 * 将请求类型映射到聊天类型
 */
function mapRequestTypeToChatType(type: string): ChatType {
  const typeMap: Record<string, ChatType> = {
    'general': ChatType.GENERAL,
    'translation': ChatType.TRANSLATION,
    'code_review': ChatType.CODE_REVIEW,
    'creative_writing': ChatType.CREATIVE_WRITING,
    'technical_support': ChatType.TECHNICAL_SUPPORT
  };

  return typeMap[type] || ChatType.GENERAL;
}