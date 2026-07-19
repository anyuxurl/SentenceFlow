# SentenceFlow 品牌资源

「流」标 —— 三道流动的波纹，呼应品牌名 **SentenceFlow / 句流** 中的「Flow / 流」。

## 文件

| 文件 | 用途 |
| --- | --- |
| `sentenceflow-icon.svg` | 主图标：渐变圆角磁贴 + 白色波纹。App 图标、社交头像、favicon 母版等首选（矢量，可导出任意尺寸） |
| `sentenceflow-mark.svg` | 纯波纹标（品牌蓝 `#0ea5e9`，透明底）。浅色背景内嵌使用 |
| `sentenceflow-mark-white.svg` | 白色波纹标（透明底）。深色 / 图片背景使用 |
| `sentenceflow-mark-mono.svg` | 单色波纹标（`#0f172a`）。单色印刷、盖章、水印等场景 |
| `../public/favicon.svg` | 站点 favicon（32px，描边略加粗以适配小尺寸）。已在 `index.html` 引用 |

> 代码内的同款标由 `components/Logo.tsx` 的 `<LogoMark />` 提供，Header 与页脚共用同一几何。改动请与本目录资源保持一致。

## 颜色

| 名称 | 值 | 用途 |
| --- | --- | --- |
| 渐变起 | `#38bdf8`（sky-400） | 磁贴左上 |
| 渐变止 | `#2563eb`（blue-600） | 磁贴右下（135°）|
| 品牌蓝 | `#0ea5e9`（sky-500） | 单色标主色 |
| 墨色 | `#0f172a`（slate-900） | 单色标深色版 |

磁贴圆角比例 25%（`rx = 边长 × 0.25`），与 App 内 `rounded-xl` 一致。

## 字标（Wordmark）

标准锁定形式为「图标 + `SentenceFlow` + `句流` 徽章」，字体：

- **SentenceFlow** — Playfair Display，Bold（700），衬线
- **句流 / 中文** — Noto Sans SC，Bold（700）

需要横版锁定图时可按此拼合；正文与 UI 英文另用 Outfit。

## 使用建议

- 波纹标四周至少保留 = 单条波纹高度 的留白。
- 不要拉伸变形、不要旋转、不要给磁贴叠加阴影以外的描边。
- 深色背景优先用 `-white` 版或渐变磁贴；避免品牌蓝波纹直接压深色（对比不足）。
