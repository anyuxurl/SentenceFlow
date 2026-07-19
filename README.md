# SentenceFlow

一个简单易用的英语句子分析工具。输入你的句子，了解其语法结构、成分和可能的语法问题。

**在线体验**: https://sentence-flow.vercel.app

---

## 🎯 这是什么

SentenceFlow 帮你快速理解英文句子的语法构成。无论是在学习英语、准备考试还是检查写作，都能提供清晰的分析。

### 适合场景
- 📚 英语学习者检查自己的句子
- 📝 准备英语考试，理解复杂句子结构
- ✍️ 写作时快速验证语法
- 🎓 学生理解句子的语法成分

---

## ✨ 功能

- **句子成分分析** - 识别主语、谓语、宾语等基本成分
- **从句识别** - 检测并说明名词性从句、定语从句、状语从句等
- **语法检查** - 发现常见的语法问题并给出改进建议
- **实时分析** - 快速得到结果

---

## 🛠️ 技术栈

- React + TypeScript
- Vite
- OpenAI 兼容 API（默认线路走 DeepSeek，可在设置中自定义）
- Vercel（含 Serverless Function 代理）

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 本地运行

1. 克隆项目
   ```bash
   git clone https://github.com/anyuxurl/SentenceFlow.git
   cd SentenceFlow
   ```

2. 安装依赖
   ```bash
   npm install
   # 或
   pnpm install
   ```

3. 配置环境变量（可选，仅「默认线路」需要）

   复制 `.env.example` 为 `.env.local` 并填入内置线路的 Key：
   ```
   BUILTIN_API_KEY=your_api_key_here
   BUILTIN_BASE_URL=https://api.qnaigc.com/v1
   BUILTIN_MODEL=deepseek/deepseek-v3.2-251201
   ```

   > 这些变量**只在服务端**（`/api/analyze` 代理）读取，不会进入前端 bundle。
   > 如果只用「自定义配置」模式（在页面设置里填自己的 Key），可跳过此步。

4. 启动开发服务器
   ```bash
   npm run dev
   ```

   打开浏览器访问 `http://localhost:5173`

### 构建

```bash
npm run build
```

生成的文件在 `dist` 目录中，可以部署到任何静态文件服务。

---

## 💡 使用方法

1. 在文本框输入你的英文句子
2. 点击「分析」按钮
3. 查看分析结果，了解：
   - 句子的基本成分
   - 各种从句（如果有）
   - 语法问题和改进建议

---

## 📁 项目结构

```
├── index.tsx              # 应用入口
├── App.tsx                # 主应用组件与状态管理
├── components/            # UI 组件（输入区、结果展示、设置弹窗、历史等）
├── services/
│   └── geminiService.ts   # OpenAI 兼容接口调用（含 JSON 解析与容错）
├── api/
│   └── analyze.ts         # Vercel Edge Function：内置线路的服务端代理
├── types.ts               # 共享类型定义
└── vite.config.ts         # Vite 配置（含开发环境 /api 代理模拟）
```

---

## 📝 开发相关

### 可用命令

```bash
npm run dev      # 启动开发服务
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

---

## 📚 API

分析通过 OpenAI 兼容的 Chat Completions 接口完成，有两种线路：

- **默认线路（内置）**：前端请求本站的 `/api/analyze` Serverless Function，由服务端用环境变量里的 `BUILTIN_API_KEY` 调用上游。密钥只存在于服务端，不会暴露给浏览器。
- **自定义配置**：在页面右上角设置中填写你自己的 Base URL / API Key / 模型，请求直接从浏览器发往你指定的端点。

部署到 Vercel 时，在 **Settings → Environment Variables** 配置 `BUILTIN_API_KEY`（及可选的 `BUILTIN_BASE_URL`、`BUILTIN_MODEL`）。

内置线路是开放端点，会消耗共享额度。生产环境可选配以下变量防滥用（不配置则不限流）：

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`：在 [Upstash](https://upstash.com) 免费创建 Redis 后填入，启用按 IP 限流。
- `RATELIMIT_REQUESTS`：每个 IP 在 10 分钟内允许的请求数，默认 30。
- `ALLOWED_ORIGINS`：额外允许的来源（逗号分隔）；同源请求始终放行，通常留空。

---

## 📄 许可证

MIT

---

## 🔗 其他资源

- 在线演示: https://sentence-flow.vercel.app
- 问题反馈: [提交 Issue](https://github.com/anyuxurl/SentenceFlow/issues)