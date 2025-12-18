---
name: Arcade City 项目设计与实现计划
overview: 基于 PRD 和 DESIGN 文档，创建一个完整的恋爱电玩城应用，包含前后端分离架构、数据库设计、用户认证、游戏逻辑和沉浸式前端界面。
todos:
  - id: init-frontend
    content: 初始化前端项目（Vite + React + TypeScript + Tailwind）
    status: completed
  - id: init-backend
    content: 初始化后端项目（Express + TypeScript）
    status: completed
  - id: prisma-schema
    content: 创建 Prisma Schema 并配置数据库连接
    status: completed
  - id: seed-data
    content: 编写 Seed 数据脚本（用户、物品、游戏配置）
    status: completed
  - id: auth-api
    content: 实现后端认证系统（注册、登录、JWT）
    status: completed
  - id: user-api
    content: 实现用户相关 API（获取信息、每日签到）
    status: completed
  - id: inventory-api
    content: 实现背包 API（获取物品列表）
    status: completed
  - id: slots-api
    content: 实现老虎机抽奖 API（包含保底机制）
    status: completed
  - id: frontend-structure
    content: 搭建前端项目结构和路由系统
    status: completed
  - id: zustand-stores
    content: 创建 Zustand 状态管理 stores
    status: completed
  - id: api-services
    content: 实现前端 API 服务层（Axios + 类型定义）
    status: completed
  - id: auth-pages
    content: 实现登录/注册页面
    status: completed
  - id: lobby-page
    content: 实现大厅页面（霓虹风格、机台展示、签到）
    status: completed
  - id: inventory-page
    content: 实现背包页面（网格布局、详情模态框）
    status: completed
  - id: slot-machine-components
    content: 实现老虎机核心组件（Reel、SlotStage、useSlotGame）
    status: completed
  - id: gsap-animations
    content: 使用 GSAP 实现滚轮滚动动画（无缝循环、回弹效果）
    status: completed
  - id: ssr-effects
    content: 实现 SSR 全屏特效（彩带、震动、闪光）
    status: completed
  - id: audio-system
    content: 集成 Howler.js 音效系统
    status: completed
  - id: neon-styling
    content: 实现霓虹灯风格样式和主题配置
    status: completed
  - id: testing-optimization
    content: 测试、优化和错误处理完善
    status: completed
---

# Arcade City 项目设计与实现计划

## 项目概述

Arcade City 是一个为特定用户（女朋友，ENFP 人格）打造的沉浸式虚拟电玩城应用。通过游戏化的老虎机玩法解锁情侣回忆（照片、文字、实体券），强调极速反馈、视觉冲击和情感价值。

## 技术架构

### 整体结构

采用前后端分离架构：

- **前端**: `frontend/` - React 18 + Vite + TypeScript + Tailwind CSS
- **后端**: `backend/` - Node.js + Express + TypeScript
- **数据库**: PostgreSQL (192.168.31.28:5432/arcadecity)
- **ORM**: Prisma

### 核心技术栈

- 状态管理: Zustand
- 动画: GSAP (复杂动画) + Framer Motion (UI 交互)
- 音效: Howler.js
- 认证: JWT

## 实施步骤

### 阶段一：项目初始化与数据库设计

#### 1.1 项目脚手架搭建

- 创建 `frontend/` 目录，使用 Vite 初始化 React + TypeScript 项目
- 配置 Tailwind CSS、ESLint、Prettier
- 创建 `backend/` 目录，初始化 Express + TypeScript 项目
- 配置 TypeScript、ESLint、环境变量管理（dotenv）

#### 1.2 Prisma 数据库设计

基于 [DESIGN.md](DESIGN.md) 中的 SQL 设计，生成 Prisma Schema：

**核心模型**:

- `User`: 用户信息、货币余额（coins_balance, tickets_balance）
- `Item`: 物品主数据（type: PHOTO/TEXT/COUPON, rarity: R/SR/SSR）
- `Game`: 游戏机台配置
- `GameLootTable`: 游戏掉落权重表
- `UserInventory`: 用户背包
- `Transaction`: 货币流水记录

**要点**:

- 使用 Prisma Enum 定义 `ItemType` 和 `Rarity`
- 设置外键关系和级联删除策略
- 添加索引优化查询性能

#### 1.3 Seed 数据脚本

创建初始数据：

- 默认用户账户
- 测试物品数据（照片 URL、文字内容、实体券）
- 游戏配置（SLOTS_01 老虎机）
- 掉落权重表（R: 70%, SR: 25%, SSR: 5%）

### 阶段二：后端 API 实现

#### 2.1 认证系统

- JWT Token 生成与验证中间件
- `POST /api/auth/register`: 用户注册
- `POST /api/auth/login`: 用户登录
- `GET /api/auth/me`: 获取当前用户信息（受保护路由）

#### 2.2 用户相关接口

- `GET /api/user/me`: 获取用户信息及余额（复用认证中间件）
- `POST /api/user/checkin`: 每日签到逻辑
  - 检查今日是否已签到
  - 发放 50 Coins
  - 记录 Transaction
  - 返回签到结果和余额

#### 2.3 背包接口

- `GET /api/inventory`: 获取用户背包列表
  - 关联查询 Item 详情
  - 按获得时间倒序
  - 支持按 rarity 和 type 筛选

#### 2.4 游戏接口

- `GET /api/games`: 获取所有机台列表及状态
- `POST /api/games/slots/play`: **核心抽奖接口**
  - 开启数据库事务
  - 检查余额（>= 10 Coins）
  - 扣除费用并记录 Transaction
  - **保底机制实现**:
    - 查询最近 9 次抽奖记录
    - 若均无 SR/SSR，强制从 SR/SSR 池抽取
    - 否则根据权重加权随机
  - 写入 UserInventory
  - 提交事务并返回奖励信息

#### 2.5 错误处理与中间件

- 全局错误处理中间件
- 请求验证中间件（使用 Zod）
- CORS 配置
- 环境变量验证

### 阶段三：前端基础架构

#### 3.1 项目结构

按照 [DESIGN.md](DESIGN.md) 的目录结构：

```
frontend/src/
├── assets/          # 图片、音效资源
├── components/
│   ├── layout/      # Layout, Header (Coin display)
│   ├── ui/          # Button, Modal, Card
│   └── game-ui/     # CoinSlot, TicketCounter
├── features/
│   ├── lobby/       # 大厅逻辑
│   ├── inventory/   # 背包逻辑
│   └── slot-machine/ # 老虎机核心逻辑
├── stores/          # Zustand stores
├── services/        # API 调用
├── hooks/           # 自定义 Hooks
└── types/           # TypeScript 类型定义
```

#### 3.2 状态管理（Zustand）

- `userStore`: 用户信息、Coins/Tickets 余额
- `inventoryStore`: 背包物品列表
- `soundStore`: 音效开关状态
- `gameStore`: 游戏状态（老虎机等）

#### 3.3 API 服务层

- 使用 Axios 创建 API 客户端
- 配置请求/响应拦截器（添加 Token、错误处理）
- 类型安全的 API 调用函数

#### 3.4 路由系统

- React Router 配置
- 受保护路由（需要登录）
- 路由：`/login`、`/lobby`、`/inventory`、`/slots`

### 阶段四：前端页面实现

#### 4.1 登录/注册页面

- 表单验证
- 调用认证 API
- Token 存储到 localStorage
- 登录成功后跳转大厅

#### 4.2 大厅页面（Lobby）

根据 [PRD.md](PRD.md) 的需求：

- **视觉**: 霓虹灯风格背景（横向卷轴或全屏）
- **顶部栏**: 头像、昵称、Coins/Tickets 显示
- **机台展示区**: 横向滚动卡片
  - 老虎机机台（可点击进入）
  - 其他机台显示"装修中"状态
- **功能按钮**: "我的背包"、"每日签到"
- **签到逻辑**: 调用 API，显示签到动画和奖励

#### 4.3 背包页面（Inventory）

- 网格布局展示物品
- 物品卡片显示：缩略图、稀有度标识（R/SR/SSR 颜色区分）
- 点击查看详情模态框
  - PHOTO: 大图展示
  - TEXT: 文字内容展示
  - COUPON: 券详情和说明
- 支持筛选（按类型、稀有度）

#### 4.4 老虎机游戏页面（Slot Machine）

根据 [PRD.md](PRD.md) 和 [DESIGN.md](DESIGN.md) 的动画要求：

**核心组件**:

- `SlotStage.tsx`: 游戏主舞台容器
- `Reel.tsx`: 单个滚轮组件（三个滚轮）
- `useSlotGame.ts`: 游戏状态机 Hook

**游戏流程**:

1. 投币：显示 Coins 消耗确认
2. 拉杆/点击：触发 API 调用
3. 滚轮动画：

   - 使用 GSAP 实现 `y` 轴位移滚动
   - Fake Loop 技术：渲染 `[Item A, Item B, ... Target, Item A, Item B]`
   - 重置 `y` 坐标实现无缝循环
   - Easing: `Back.easeOut` 物理回弹效果
   - 支持快速跳过动画

4. 停止判定：API 返回结果后，滚轮停在目标位置
5. 奖励展示：

   - R/SR: 普通特效
   - SSR: 全屏特效（彩带、震动、闪光）

6. 物品存入背包：自动更新状态

**ENFP 特性优化**:

- 动画时长适中（不超过 3 秒）
- SSR 特效最大化视觉冲击
- 音效反馈（投币、滚动、中奖音效）

### 阶段五：动画与特效

#### 5.1 GSAP 动画实现

- 滚轮滚动动画配置
- 无缝循环逻辑
- 回弹缓动函数
- 性能优化（GPU 加速）

#### 5.2 SSR 全屏特效

- 彩带粒子效果
- 屏幕震动/闪烁
- 奖励展示模态框
- 音效配合

#### 5.3 音效系统

- 使用 Howler.js 管理音效
- 音效资源：投币、滚动、中奖、背景音乐
- 音量控制和静音开关

### 阶段六：样式与主题

#### 6.1 霓虹灯风格设计

- Tailwind 自定义主题配置
- 霓虹色彩方案（粉紫、蓝绿、亮黄）
- 发光效果（box-shadow、text-shadow）
- 暗色背景适配

#### 6.2 响应式设计

- 移动端适配
- 触摸手势支持
- 不同屏幕尺寸优化

### 阶段七：测试与优化

#### 7.1 功能测试

- API 接口测试
- 保底机制验证
- 前端交互测试

#### 7.2 性能优化

- 图片懒加载
- 代码分割（路由级别）
- API 请求防抖/节流

#### 7.3 错误处理

- 全局错误边界
- API 错误提示
- 网络异常处理

## 关键技术要点

### 保底机制实现

查询用户最近 9 次抽奖，若均无 SR/SSR，第 10 次强制从高稀有度池抽取。需要在数据库事务中确保数据一致性。

### 动画性能

使用 GSAP 的 GPU 加速和 Transform 属性，避免频繁的 Layout/Repaint。Fake Loop 技术减少 DOM 操作。

### 数据同步

前端状态（Zustand）与后端数据保持同步，抽奖后立即更新余额和背包。

## 数据库连接信息

- 主机: 192.168.31.28
- 用户: postgres
- 密码: HE@&#7788
- 数据库: arcadecity