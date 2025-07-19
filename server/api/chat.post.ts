import { defineEventHandler, readBody } from "h3";
import type { ChatRequest, ChatResponse } from "~/types";
import { ResponseHelper } from "~/server/lib/response";
import { langChainService, ChatType } from "~/server/lib/langchain-service";

export default defineEventHandler(async (event) => {
  const response = new ResponseHelper();
  const startTime = Date.now();
  
  try {
    const body = await readBody<ChatRequest>(event);

    // 验证请求参数
    if (!body?.comment?.trim()) {
      return response.badRequest("请求参数不能为空");
    }

    console.log("收到用户问题:", body.comment);
    console.log("请求类型:", body.type || "auto-detect");

    // 处理聊天消息
    const result = await processChatMessage(body);
    
    const processingTime = Date.now() - startTime;
    console.log(`处理完成，耗时: ${processingTime}ms`);

    return response.success(result, "请求成功");
  } catch (error) {
    console.error("Chat API 错误:", error);
    return response.fromError(error);
  }
});

/**
 * 处理聊天消息的核心逻辑
 */
async function processChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const { comment, type, language, context, streaming } = request;
  
  try {
    // 确定聊天类型
    let chatType: ChatType;
    if (type) {
      chatType = mapRequestTypeToChatType(type);
    } else {
      // 自动检测聊天类型
      chatType = langChainService.detectChatType(comment);
      console.log("自动检测到聊天类型:", chatType);
    }

    // 构建聊天上下文
    const chatContext = {
      type: chatType,
      language,
      previousMessages: context?.previousMessages,
      metadata: {
        ...context?.metadata,
        requestTime: new Date().toISOString(),
        userAgent: "LangChain Chat Assistant"
      }
    };

    let content: string;

    // 根据是否需要流式处理选择不同的处理方式
    if (streaming) {
      content = await langChainService.streamMessage(
        comment,
        chatType,
        chatContext,
        (chunk) => {
          // 这里可以实现实时流式响应
          console.log("流式输出:", chunk);
        }
      );
    } else {
      content = await langChainService.processMessage(
        comment,
        chatType,
        chatContext
      );
    }

    console.log("AI 回复:", content);

    // 构建响应
    const chatResponse: ChatResponse = {
      content,
      type: chatType,
      timestamp: new Date(),
      metadata: {
        modelInfo: langChainService.getModelInfo(),
        detectedType: chatType,
        processingTime: Date.now() - Date.now() // 这里应该传入开始时间
      }
    };

    return chatResponse;
  } catch (error) {
    console.error("处理聊天消息错误:", error);
    throw new Error("AI 服务暂时不可用，请稍后重试");
  }
}

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

/**
 * 批量处理聊天消息（可用于批量API）
 */
export async function processBatchMessages(
  requests: ChatRequest[]
): Promise<ChatResponse[]> {
  const inputs = requests.map(req => ({
    input: req.comment,
    type: req.type ? mapRequestTypeToChatType(req.type) : langChainService.detectChatType(req.comment),
    context: {
      type: req.type ? mapRequestTypeToChatType(req.type) : langChainService.detectChatType(req.comment),
      language: req.language,
      previousMessages: req.context?.previousMessages,
      metadata: req.context?.metadata
    }
  }));

  const results = await langChainService.processMessages(inputs);
  
  return results.map((content, index) => ({
    content,
    type: inputs[index].type,
    timestamp: new Date(),
    metadata: {
      modelInfo: langChainService.getModelInfo(),
      detectedType: inputs[index].type
    }
  }));
}
