# LangChain Chat Assistant

基于 Nuxt 3、LangChain 和 Ollama 的智能聊天助手应用。

## 🚀 特性

- 🎯 基于 Nuxt 3 的现代化 Vue.js 应用
- 🤖 集成 LangChain 和 Ollama 本地大语言模型
- 💬 实时聊天界面，支持流式对话
- 🎨 使用 Element Plus 构建的美观 UI
- 📱 响应式设计，支持移动端
- 🔧 TypeScript 全栈支持
- ⚡ 高性能的服务端渲染

## 🛠️ 技术栈

- **前端框架**: Nuxt 3 + Vue 3
- **UI 组件库**: Element Plus
- **样式**: SCSS
- **类型系统**: TypeScript
- **AI 框架**: LangChain
- **本地模型**: Ollama
- **包管理器**: pnpm

## 📋 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Ollama (本地安装并运行)

## 🔧 安装与配置

### 1. 克隆项目

```bash
git clone <repository-url>
cd LangChainTS
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置 Ollama

确保 Ollama 已安装并运行：

```bash
# 安装 Ollama (如果尚未安装)
# 访问 https://ollama.ai 下载安装

# 拉取模型 (例如 qwen)
ollama pull qwen

# 启动 Ollama 服务
ollama serve
```

### 4. 环境变量配置

创建 `.env` 文件：

```bash
# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen
```

## 🚀 开发

启动开发服务器：

```bash
pnpm run dev
```

应用将在 `http://localhost:3000` 启动。

## 📦 构建

### 生产构建

```bash
pnpm run build
```

### 预览生产构建

```bash
pnpm run preview
```

### 静态生成

```bash
pnpm run generate
```

## 🧪 代码质量

### 类型检查

```bash
pnpm run type-check
```

### 代码检查

```bash
pnpm run lint
```

### 自动修复

```bash
pnpm run lint:fix
```

## 📁 项目结构

```
├── .trae/                 # Trae AI 配置
├── assets/                # 静态资源
│   └── css/              # 样式文件
├── components/           # Vue 组件
├── config/               # 配置文件
├── pages/                # 页面组件
│   ├── hooks/           # 自定义 hooks
│   └── index.vue        # 主页面
├── public/               # 公共静态文件
├── server/               # 服务端代码
│   ├── api/             # API 路由
│   ├── lib/             # 服务端工具库
│   ├── plugins/         # Nitro 插件
│   └── routes/          # 服务端路由
├── types/                # TypeScript 类型定义
├── app.vue              # 根组件
├── nuxt.config.ts       # Nuxt 配置
└── package.json         # 项目配置
```

## 🔌 API 接口

### POST /api/chat

发送聊天消息到 AI 助手。

**请求体:**
```json
{
  "comment": "用户消息内容"
}
```

**响应:**
```json
{
  "code": 200,
  "data": "AI 回复内容",
  "message": "请求成功"
}
```

## 🎨 自定义配置

### Ollama 模型配置

在 `config/index.ts` 中修改 Ollama 配置：

```typescript
ollama: {
  baseUrl: 'http://localhost:11434',
  model: 'qwen',  // 更换为其他模型
  temperature: 0.7,
  maxTokens: 2048,
}
```

### UI 主题配置

在 `config/index.ts` 中修改 UI 配置：

```typescript
ui: {
  theme: 'light',
  primaryColor: '#409EFF',
  maxMessageLength: 1000,
  chatHistoryLimit: 100,
}
```

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

1. **Ollama 连接失败**
   - 确保 Ollama 服务正在运行
   - 检查 `OLLAMA_BASE_URL` 配置是否正确

2. **模型加载失败**
   - 确保已拉取所需的模型：`ollama pull qwen`
   - 检查 `OLLAMA_MODEL` 配置是否正确

3. **依赖安装失败**
   - 确保 Node.js 版本 >= 18.0.0
   - 使用 pnpm 而不是 npm 或 yarn

## 📞 支持

如有问题或建议，请提交 [Issue](https://github.com/your-repo/issues)。
