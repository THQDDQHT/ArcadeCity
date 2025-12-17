---

# 🛠️ 文档二：技术设计文档 (DESIGN.md)

## 1. 技术栈 (Tech Stack)

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS.
- _State_: Zustand (全局状态: 余额, 背包).
- _Animation_: GSAP (高性能复杂动画), Framer Motion (UI 交互).
- _Audio_: Howler.js.

- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL.
- **ORM**: Prisma 或 TypeORM (推荐 Prisma，AI 生成 Schema 极其准确).

## 2. 数据库架构 (Database Schema)

请基于以下设计创建 PostgreSQL 表结构：

```sql
-- 1. Users Table
-- 存储玩家基础信息和货币余额
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  coins_balance INTEGER DEFAULT 100,
  tickets_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP DEFAULT NOW()
);

-- 2. Items Table (Master Data)
-- 定义所有可抽取的奖品元数据
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- ENUM: 'PHOTO', 'TEXT', 'COUPON'
  rarity VARCHAR(20) NOT NULL, -- ENUM: 'R', 'SR', 'SSR'
  title VARCHAR(255),
  content TEXT NOT NULL, -- 图片URL 或 文字内容
  description TEXT, -- 获得后的配文
  is_hidden BOOLEAN DEFAULT FALSE -- 是否隐藏（用于预埋彩蛋）
);

-- 3. Games Table
-- 定义游戏机台配置
CREATE TABLE games (
  code VARCHAR(50) PRIMARY KEY, -- e.g., 'SLOTS_01'
  name VARCHAR(255),
  cost_per_play INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE
);

-- 4. Game Loot Tables
-- 定义游戏掉落权重
CREATE TABLE game_loot_tables (
  id SERIAL PRIMARY KEY,
  game_code VARCHAR(50) REFERENCES games(code),
  item_id INTEGER REFERENCES items(id),
  weight INTEGER NOT NULL, -- 权重值，如 100
  is_guaranteed BOOLEAN DEFAULT FALSE -- 是否为保底池物品
);

-- 5. User Inventory
-- 玩家获得的所有物品
CREATE TABLE user_inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  item_id INTEGER REFERENCES items(id),
  obtained_at TIMESTAMP DEFAULT NOW(),
  is_consumed BOOLEAN DEFAULT FALSE, -- 对于COUPON，是否已使用
  source_game_code VARCHAR(50) -- 来源游戏
);

-- 6. Transactions
-- 货币流水记录
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount INTEGER NOT NULL, -- 正数增加，负数扣除
  currency_type VARCHAR(20) NOT NULL, -- 'COIN' or 'TICKET'
  reason VARCHAR(255), -- e.g., 'GAME_PLAY', 'DAILY_CHECKIN'
  created_at TIMESTAMP DEFAULT NOW()
);

```

## 3. 后端 API 接口定义 (API Specification)

### 3.1 核心/大厅接口

- `GET /api/user/me`: 获取用户信息及余额。
- `POST /api/user/checkin`: 每日签到（发放 Coins）。
- `GET /api/inventory`: 获取当前用户的背包列表。

### 3.2 游戏通用接口

- `GET /api/games`: 获取所有机台列表及状态。

### 3.3 老虎机专用接口

- `POST /api/games/slots/play`: **核心接口**
- **Request**: `{ userId: number }`
- **Logic**:

1. 开启数据库事务。
2. 检查 `users.coins_balance` 是否 >= 10。
3. 扣除 10 Coins，记录 `transactions`。
4. **执行抽奖算法**:

- 查询该用户最近 9 次 `user_inventory` 记录。
- 若无 SR/SSR，强制从 `game_loot_tables` 筛选 SR/SSR 物品。
- 否则，根据 `weight` 进行加权随机。

5. 将命中物品写入 `user_inventory`。
6. 提交事务。

- **Response**:

```json
{
  "success": true,
  "data": {
    "rewardItem": { ...itemDetails },
    "remainingCoins": 90,
    "isPityTriggered": false
  }
}




## 4. 前端组件架构 (Frontend Architecture)

### 4.1 目录结构

```

src/
├── assets/ # 图片、音效
├── components/
│ ├── layout/ # Layout, Header (Coin display)
│ ├── ui/ # Button, Modal, Card (基础 UI 库)
│ └── game-ui/ # CoinSlot, TicketCounter (游戏通用 UI)
├── features/
│ ├── lobby/ # 大厅逻辑 (MachineList)
│ ├── inventory/ # 背包逻辑 (Grid, ItemDetail)
│ └── slot-machine/# 老虎机核心逻辑
│ ├── Reel.tsx # 单个滚轮组件
│ ├── SlotStage.tsx # 游戏主舞台
│ └── useSlotGame.ts # 游戏状态机 Hook
├── stores/ # Zustand store (userStore, soundStore)
└── services/ # API calls

```

### 4.2 关键动画逻辑 (GSAP)

* **老虎机滚动**:
* 使用 GSAP 的 `y` 轴位移模拟滚动。
* **Fake Loop**: 在 DOM 中渲染 `[Item A, Item B, ... Item Target, Item A, Item B]`，通过重置 `y` 坐标实现无缝循环。
* **Easing**: 结束时使用 `Back.easeOut` 模拟物理回弹。


### 💡 如何使用这份文档给 AI？

1. **第一步**：把 `DESIGN.md` 中的 **数据库架构 (SQL)** 复制给 AI，让它帮你生成初始的 SQL 文件或 Prisma Schema。

- _Prompt:_ "这是我的数据库设计，请帮我生成 Prisma schema 和初始的 seed 数据脚本（包含一些测试用的照片和情话）。"

2. **第二步**：让 AI 写后端逻辑。

- _Prompt:_ "基于上述数据库，请用 Node.js/Express 写出 `POST /api/games/slots/play` 的接口逻辑，必须包含文档中提到的保底机制和扣费事务处理。"

3. **第三步**：让 AI 写前端大厅。

- _Prompt:_ "请使用 React + Tailwind 实现 `Lobby` 页面，根据 PRD 的描述，需要显示金币、头像和横向滚动的游戏机台入口。"

4. **第四步**：让 AI 写老虎机动效（最难的部分）。

- _Prompt:_ "现在实现 SlotMachine 组件。请使用 GSAP 实现三个滚轮的滚动效果。当 API 返回结果后，滚轮应该减速并带有回弹效果停在目标图片上。请参考 Tech Design 中的动画逻辑。"
```
