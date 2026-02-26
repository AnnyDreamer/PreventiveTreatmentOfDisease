# 治未病 · 慢病管理平台

## 项目概览
中医"治未病"慢病管理平台 — 基于中医体质辨识的智能慢病管理系统。

## 技术栈
- **Monorepo**: pnpm workspace + Turborepo
- **Web端（医生后台）**: Next.js 15 App Router + shadcn/ui风格组件 + Tailwind CSS 4
- **小程序端（患者端）**: Taro 4.x + React 18 + TypeScript
- **数据库**: PostgreSQL + Prisma 6
- **AI**: 通义千问 API (via Vercel AI SDK + openai-compatible provider)
- **状态管理**: Zustand

## 项目结构
```
apps/web/          — Next.js Web应用(医生后台 + 全部API Routes)
apps/mini/         — Taro微信小程序(患者端)
packages/shared/   — 共享类型、常量(9种体质60+题问卷)、工具函数
packages/db/       — Prisma Schema + 种子数据
```

## 常用命令
```bash
pnpm install              # 安装依赖
pnpm dev:web              # 启动Web端开发服务器
pnpm dev:mini             # 启动小程序编译（需微信开发者工具）
pnpm build                # 构建所有项目
pnpm db:generate          # 生成Prisma Client
pnpm db:push              # 推送Schema到数据库
pnpm db:seed              # 填充种子数据
pnpm db:studio            # 打开Prisma Studio
```

## 环境配置
复制 `.env.example` 为 `apps/web/.env`，填入：
- `DATABASE_URL` — PostgreSQL连接字符串
- `DASHSCOPE_API_KEY` — 通义千问API Key
- `JWT_SECRET` — JWT签名密钥

## 设计风格
"现代水墨风" — 融合传统中医美学与现代仪表盘设计：
- 主色: `#8b5a2b` (草本棕herb)
- 背景: `#faf7f2` (宣纸白)
- 强调: `#c83232` (朱砂红cinnabar)
- 成功: `#2d9a64` (青瓷绿celadon)
- 文字: `#1a1a2e` (墨色ink)
- 字体: Noto Serif SC (标题) + Noto Sans SC (正文)
