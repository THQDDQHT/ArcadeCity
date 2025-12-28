# Arcade City - 电玩城

一个沉浸式的虚拟电玩城应用，通过游戏化的老虎机玩法解锁情侣回忆（照片、文字、实体券）。

## 技术栈

### 前端

- React 18 + Vite + TypeScript
- Tailwind CSS (霓虹灯风格)
- Zustand (状态管理)
- GSAP (动画)
- Framer Motion (UI 交互)
- Howler.js (音效)
- React Router (路由)

### 后端

- Node.js + Express + TypeScript
- PostgreSQL
- Prisma (ORM)
- JWT (认证)
- Zod (验证)

## 项目结构

```
ArcadeCity/
├── frontend/          # 前端项目
│   └── src/
│       ├── components/    # 组件
│       ├── features/      # 功能模块
│       ├── stores/        # Zustand状态管理
│       ├── services/      # API服务
│       └── types/         # TypeScript类型
├── backend/           # 后端项目
│   └── src/
│       ├── routes/        # 路由
│       ├── middleware/    # 中间件
│       └── utils/         # 工具函数
└── prisma/            # 数据库Schema和Seed
```

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL
- npm 或 yarn

### 数据库设置

1. 创建数据库：

```sql
CREATE DATABASE arcadecity;
```

2. 配置数据库连接（创建 `backend/.env`）：

```env
DATABASE_URL="postgresql://postgres:password@192.168.31.28:5432/arcadecity?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
```

3. 运行迁移和 Seed：

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 启动后端

```bash
cd backend
npm install
npm run dev
```

后端将运行在 http://localhost:3001

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173

### 默认账户

- 用户名: `player1`
- 密码: `password123`

## 功能特性

- ✅ 用户认证（注册/登录）
- ✅ 每日签到（获得 50 金币）
- ✅ 老虎机游戏（消耗 10 金币）
- ✅ 保底机制（连续 9 次未中 SR/SSR，第 10 次必中）
- ✅ 背包系统（查看获得的物品）
- ✅ SSR 特效（全屏彩带、震动、闪光）
- ✅ GSAP 滚轮动画（无缝循环、物理回弹）
- ✅ 霓虹灯风格 UI

## API 接口

### 认证

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户

- `GET /api/user/me` - 获取用户信息
- `POST /api/user/checkin` - 每日签到

### 背包

- `GET /api/inventory` - 获取背包列表

### 游戏

- `GET /api/games` - 获取游戏列表
- `POST /api/games/slots/play` - 老虎机抽奖

## 开发说明

### 数据库迁移

```bash
cd backend
npx prisma migrate dev
```

### 查看数据库

```bash
cd backend
npx prisma studio
```

## 许可证

MIT

