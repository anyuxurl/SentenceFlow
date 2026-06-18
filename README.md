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
- Gemini API
- 部署在 Vercel

---

## 🚀 快速开始

### 环境要求
- Node.js 16+
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

3. 配置环境变量
   
   创建 `.env.local` 文件：
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

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
src/
├── App.tsx           # 主应用组件
├── styles/           # 样式文件
├── utils/            # API 调用和工具函数
├── data/             # 示例数据
└── main.tsx
```

---

## 📝 开发相关

### 可用命令

```bash
npm run dev      # 启动开发服务
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run lint     # ESLint 检查
```

---

## 📚 API

使用 Google Gemini API 进行文本分析。需要在 `.env.local` 中配置 `VITE_GEMINI_API_KEY`。

---

## 📄 许可证

MIT

---

## 🔗 其他资源

- 在线演示: https://sentence-flow.vercel.app
- 问题反馈: [提交 Issue](https://github.com/anyuxurl/SentenceFlow/issues)
"