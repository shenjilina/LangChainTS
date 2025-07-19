import { Ollama } from "@langchain/community/llms/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import type { BaseLanguageModel } from "@langchain/core/language_models/base";
import { getConfig } from "~/config";

/**
 * 聊天类型枚举
 */
export enum ChatType {
  GENERAL = "general",
  TRANSLATION = "translation",
  CODE_REVIEW = "code_review",
  CREATIVE_WRITING = "creative_writing",
  TECHNICAL_SUPPORT = "technical_support"
}

/**
 * 聊天上下文接口
 */
export interface ChatContext {
  type: ChatType;
  language?: string;
  previousMessages?: Array<{ role: string; content: string }>;
  metadata?: Record<string, any>;
}

/**
 * LangChain 服务类
 * 负责管理 Prompts、Chains 和模型交互
 */
export class LangChainService {
  private model: BaseLanguageModel;
  private outputParser: StringOutputParser;

  constructor() {
    this.initializeModel();
    this.outputParser = new StringOutputParser();
  }

  /**
   * 初始化 Ollama 模型
   */
  private initializeModel(): void {
    const config = getConfig();
    
    this.model = new Ollama({
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.model,
      temperature: config.ollama.temperature,
    });
  }

  /**
   * 创建系统提示模板
   */
  private createSystemPrompt(type: ChatType, context?: ChatContext): string {
    const basePrompts = {
      [ChatType.GENERAL]: `你是一个智能助手，能够回答各种问题。请根据用户的问题提供准确、有用、友好的回答。
特点：
- 回答要准确、详细且易于理解
- 保持友好和专业的语调
- 如果不确定答案，请诚实说明
- 提供实用的建议和解决方案`,

      [ChatType.TRANSLATION]: `你是一个专业的翻译助手，擅长多语言翻译。
特点：
- 提供准确、自然的翻译
- 保持原文的语调和风格
- 考虑文化背景和语境
- 如需要，提供多种翻译选项
目标语言：${context?.language || '中文'}`,

      [ChatType.CREATIVE_WRITING]: `你是一个创意写作助手，能够帮助用户进行各种创意写作。
特点：
- 提供创意灵感和想法
- 协助故事情节发展
- 改善文字表达和风格
- 保持创造性和原创性`,

      [ChatType.TECHNICAL_SUPPORT]: `你是一个技术支持专家，能够解决各种技术问题。
特点：
- 提供详细的技术解决方案
- 逐步指导问题解决过程
- 解释技术概念和原理
- 推荐相关工具和资源`
    };

    return basePrompts[type] || basePrompts[ChatType.GENERAL];
  }

  /**
   * 创建聊天提示模板
   */
  private createChatPrompt(type: ChatType, context?: ChatContext): ChatPromptTemplate {
    const systemPrompt = this.createSystemPrompt(type, context);
    
    // 如果有历史消息，构建对话历史
    const messages: Array<[string, string]> = [["system", systemPrompt]];
    
    if (context?.previousMessages && context.previousMessages.length > 0) {
      // 添加历史对话（最多保留最近5轮对话）
      const recentMessages = context.previousMessages.slice(-10);
      for (const msg of recentMessages) {
        if (msg.role === "user") {
          messages.push(["human", msg.content]);
        } else if (msg.role === "assistant") {
          messages.push(["ai", msg.content]);
        }
      }
    }
    
    // 添加当前用户输入
    messages.push(["human", "用户问题：{input}"]);
    
    return ChatPromptTemplate.fromMessages(messages);
  }

  /**
   * 创建处理链
   */
  private createChain(type: ChatType, context?: ChatContext): RunnableSequence {
    const prompt = this.createChatPrompt(type, context);
    return prompt.pipe(this.model).pipe(this.outputParser);
  }

  /**
   * 处理聊天消息
   */
  async processMessage(
    input: string, 
    type: ChatType = ChatType.GENERAL, 
    context?: ChatContext
  ): Promise<string> {
    try {
      const chain = this.createChain(type, context);
      
      const result = await chain.invoke({
        input: input.trim(),
        ...context?.metadata
      });

      return result || "抱歉，我无法生成回复。";
    } catch (error) {
      console.error("LangChain 处理错误:", error);
      throw new Error("AI 服务暂时不可用，请稍后重试");
    }
  }

  /**
   * 批量处理消息
   */
  async processMessages(
    inputs: Array<{ input: string; type?: ChatType; context?: ChatContext }>
  ): Promise<string[]> {
    const promises = inputs.map(({ input, type = ChatType.GENERAL, context }) =>
      this.processMessage(input, type, context)
    );
    
    return Promise.all(promises);
  }

  /**
   * 流式处理消息（如果模型支持）
   */
  async streamMessage(
    input: string,
    type: ChatType = ChatType.GENERAL,
    context?: ChatContext,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const chain = this.createChain(type, context);
      
      // 如果模型支持流式输出
      if (this.model.streaming) {
        let fullResponse = "";
        
        const stream = await chain.stream({
          input: input.trim(),
          ...context?.metadata
        });
        
        for await (const chunk of stream) {
          fullResponse += chunk;
          onChunk?.(chunk);
        }
        
        return fullResponse;
      } else {
        // 回退到普通处理
        return this.processMessage(input, type, context);
      }
    } catch (error) {
      console.error("LangChain 流式处理错误:", error);
      throw new Error("AI 服务暂时不可用，请稍后重试");
    }
  }

  /**
   * 检测聊天类型
   */
  detectChatType(input: string): ChatType {
    const lowerInput = input.toLowerCase();
    
    // 翻译相关关键词
    if (lowerInput.includes("翻译") || lowerInput.includes("translate") || 
        lowerInput.includes("英文") || lowerInput.includes("中文")) {
      return ChatType.TRANSLATION;
    }
    
    // 代码相关关键词
    if (lowerInput.includes("代码") || lowerInput.includes("code") || 
        lowerInput.includes("函数") || lowerInput.includes("bug")) {
      return ChatType.CODE_REVIEW;
    }
    
    // 创意写作关键词
    if (lowerInput.includes("写作") || lowerInput.includes("故事") || 
        lowerInput.includes("创意") || lowerInput.includes("文章")) {
      return ChatType.CREATIVE_WRITING;
    }
    
    // 技术支持关键词
    if (lowerInput.includes("技术") || lowerInput.includes("配置") || 
        lowerInput.includes("安装") || lowerInput.includes("错误")) {
      return ChatType.TECHNICAL_SUPPORT;
    }
    
    return ChatType.GENERAL;
  }

  /**
   * 获取模型信息
   */
  getModelInfo(): Record<string, any> {
    const config = getConfig();
    return {
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.model,
      temperature: config.ollama.temperature,
      streaming: this.model.streaming || false
    };
  }
}

// 导出单例实例
export const langChainService = new LangChainService();