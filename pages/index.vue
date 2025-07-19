<script lang="ts" setup>
import { useChat } from "~/pages/hooks/useChat";
import type { TdChatItemMeta } from "@tdesign-vue-next/chat";
import avatar from "~/assets/image/avatar.png";
import assistant from "~/assets/image/assistant.png";

const userQuestion = ref<string>("");
const isStreamLoad = ref(false);
const useStreamingMode = ref<boolean>(true);

const { 
  messages, 
  isLoading, 
  isStreaming, 
  error, 
  streamingMessageId,
  sendMessage, 
  clearMessages, 
  clearError,
  stopStreaming
} = useChat();

// 转换消息格式为 TDesign Chat 需要的格式
const chatData = computed<TdChatItemMeta[]>(() => {
  return messages.value.map((message) => ({
    role: message.type === "user" ? "user" : "assistant",
    content: message.content,
    datetime: message.timestamp.toLocaleTimeString(),
    avatar: message.type === "user" ? avatar : assistant,
    name: message.type === "user" ? "用户名称" : "AI助手",
    // 为正在流式输出的消息添加特殊标识
    isStreaming: streamingMessageId.value === message.id,
  }));
});

const handleSend = async (value: string) => {
  if (!value.trim()) {
    return;
  }

  try {
    await sendMessage(value.trim(), useStreamingMode.value);
  } catch (error) {
    console.error("Chat error:", error);
  }
};

const handleClearMessages = () => {
  clearMessages();
};

const handleStopStreaming = () => {
  stopStreaming();
};

const toggleStreamingMode = () => {
  useStreamingMode.value = !useStreamingMode.value;
};

// 监听错误状态
watch(error, (newError) => {
  if (newError) {
    console.error("Chat error:", newError);
    clearError();
  }
});

// 监听流式状态
watch(isStreaming, (streaming) => {
  isStreamLoad.value = streaming;
});
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>LangChain 聊天助手</h1>
      <div class="header-controls">
        <!-- 流式模式切换 -->
        <t-switch
          v-model="useStreamingMode"
          :disabled="isLoading || isStreaming"
          size="large"
        >
          <template #label>
            <span class="switch-label">
              {{ useStreamingMode ? '流式模式' : '普通模式' }}
            </span>
          </template>
        </t-switch>
        
        <!-- 停止流式输出按钮 -->
        <t-button
          v-if="isStreaming"
          size="small"
          variant="outline"
          theme="warning"
          @click="handleStopStreaming"
        >
          停止输出
        </t-button>
        
        <!-- 清空聊天记录按钮 -->
        <t-button
          v-if="messages.length > 0"
          size="small"
          variant="outline"
          theme="danger"
          :disabled="isLoading || isStreaming"
          @click="handleClearMessages"
        > 
          清空聊天记录
        </t-button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div v-if="isStreaming" class="streaming-indicator">
      <t-loading size="small" />
      <span>AI正在思考并实时回复中...</span>
    </div>

    <div class="chat-content">
      <t-chat
        :data="chatData"
        :clear-history="chatData.length > 0 && !isStreamLoad"
        :text-loading="isLoading && !isStreaming"
        layout="both"
        :is-stream-load="isStreamLoad"
        @clear="handleClearMessages"
      />
    </div>

    <div class="chat-input">
      <t-chat-sender
        v-model="userQuestion"
        placeholder="请输入您的问题..."
        :disabled="isLoading || isStreaming"
        :loading="isLoading && !isStreaming"
        @send="handleSend"
      >
        <template #suffix>
          <div class="input-status">
            <span v-if="useStreamingMode" class="mode-indicator streaming">
              流式
            </span>
            <span v-else class="mode-indicator normal">
              普通
            </span>
          </div>
        </template>
      </t-chat-sender>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 80%,
        rgba(120, 119, 198, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(255, 119, 198, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 40%,
        rgba(120, 219, 255, 0.2) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;

  h1 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 16px;

    .switch-label {
      font-size: 14px;
      font-weight: 500;
      color: #666;
      margin-left: 8px;
    }

    :deep(.t-switch) {
      .t-switch__handle {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      &.t-is-checked .t-switch__track {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }
  }

  :deep(.t-button) {
    border: none;
    color: white;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &[theme="danger"] {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
      }
    }

    &[theme="warning"] {
      background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
      box-shadow: 0 4px 12px rgba(255, 167, 38, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 167, 38, 0.4);
      }
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      transform: none;
    }
  }
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;

  span {
    color: #667eea;
    font-weight: 500;
    font-size: 14px;
  }

  :deep(.t-loading) {
    color: #667eea;
  }
}

.chat-content {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;

  :deep(.t-chat) {
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .t-chat__content {
      padding: 20px;
    }

    .t-chat__item {
      margin-bottom: 16px;
      animation: slideInUp 0.3s ease-out;

      &--user {
        .t-chat__item-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 18px 18px 4px 18px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      }

      &--assistant {
        .t-chat__item-content {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #333;
          border-radius: 18px 18px 18px 4px;
          padding: 12px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
      }
    }

    .t-chat__item-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }
}

.chat-input {
  position: relative;
  z-index: 1;

  :deep(.t-chat-sender) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .t-input {
      background: transparent;
      border: none;
      padding: 16px 20px;
      font-size: 16px;

      &::placeholder {
        color: rgba(0, 0, 0, 0.4);
      }

      &:focus {
        box-shadow: none;
        outline: none;
      }
    }

    .t-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      margin: 8px;
      border-radius: 12px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        transform: none;
        box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
      }
    }
  }

  .input-status {
    display: flex;
    align-items: center;
    margin-right: 12px;

    .mode-indicator {
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;

      &.streaming {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }

      &.normal {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #666;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
    }
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-container {
    padding: 16px;
    max-width: 100%;
  }

  .chat-header {
    padding: 16px 20px;
    margin-bottom: 16px;

    h1 {
      font-size: 24px;
    }
  }

  .chat-content {
    margin-bottom: 16px;

    :deep(.t-chat) {
      border-radius: 16px;

      .t-chat__content {
        padding: 16px;
      }
    }
  }

  .chat-input {
    :deep(.t-chat-sender) {
      border-radius: 16px;

      .t-input {
        padding: 12px 16px;
        font-size: 14px;
      }
    }
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .chat-container {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }

  .chat-header {
    background: rgba(45, 55, 72, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .chat-content {
    :deep(.t-chat) {
      background: rgba(45, 55, 72, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .t-chat__item--assistant {
        .t-chat__item-content {
          background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .chat-input {
    :deep(.t-chat-sender) {
      background: rgba(45, 55, 72, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .t-input {
        color: #e2e8f0;

        &::placeholder {
          color: rgba(226, 232, 240, 0.4);
        }
      }
    }
  }
}
</style>
