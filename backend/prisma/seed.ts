import { PrismaClient, ItemType, Rarity, Item } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充种子数据...');

  // 创建默认用户
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'player1' },
    update: {},
    create: {
      username: 'player1',
      password: hashedPassword,
      avatarUrl: 'https://via.placeholder.com/150',
      coinsBalance: 100,
      ticketsBalance: 0,
    },
  });
  console.log('✅ 用户创建完成:', user.username);

  // 创建游戏
  const game = await prisma.game.upsert({
    where: { code: 'SLOTS_01' },
    update: {},
    create: {
      code: 'SLOTS_01',
      name: '老虎机',
      costPerPlay: 10,
      isActive: true,
    },
  });
  console.log('✅ 游戏创建完成:', game.name);

  // 创建物品 - R级 (70%)
  const rItems = [
    {
      type: ItemType.PHOTO,
      rarity: Rarity.R,
      title: '日常照片 1',
      content: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Photo+R1',
      description: '一张美好的日常照片',
    },
    {
      type: ItemType.PHOTO,
      rarity: Rarity.R,
      title: '日常照片 2',
      content: 'https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Photo+R2',
      description: '另一张美好的日常照片',
    },
    {
      type: ItemType.TEXT,
      rarity: Rarity.R,
      title: '甜言蜜语 1',
      content: '今天也是爱你的一天 ❤️',
      description: '温暖的话语',
    },
    {
      type: ItemType.TEXT,
      rarity: Rarity.R,
      title: '甜言蜜语 2',
      content: '你是我生命中最美好的意外 ✨',
      description: '浪漫的话语',
    },
    {
      type: ItemType.TEXT,
      rarity: Rarity.R,
      title: '段子 1',
      content: '为什么程序员都喜欢黑暗模式？因为光也是一种bug！',
      description: '有趣的段子',
    },
  ];

  // 创建物品 - SR级 (25%)
  const srItems = [
    {
      type: ItemType.PHOTO,
      rarity: Rarity.SR,
      title: '精选合照 1',
      content: 'https://via.placeholder.com/400/9B59B6/FFFFFF?text=Photo+SR1',
      description: '珍贵的合照回忆',
    },
    {
      type: ItemType.PHOTO,
      rarity: Rarity.SR,
      title: '精选合照 2',
      content: 'https://via.placeholder.com/400/3498DB/FFFFFF?text=Photo+SR2',
      description: '美好的合照回忆',
    },
  ];

  // 创建物品 - SSR级 (5%)
  const ssrItems = [
    {
      type: ItemType.PHOTO,
      rarity: Rarity.SSR,
      title: '核心回忆',
      content: 'https://via.placeholder.com/500/E74C3C/FFFFFF?text=Photo+SSR1',
      description: '最珍贵的回忆照片',
    },
    {
      type: ItemType.COUPON,
      rarity: Rarity.SSR,
      title: '按摩券',
      content: '享受一次专业按摩服务',
      description: '使用后可以获得一次按摩服务',
    },
    {
      type: ItemType.COUPON,
      rarity: Rarity.SSR,
      title: '洗碗券',
      content: '免除一次洗碗任务',
      description: '使用后可以免除一次洗碗',
    },
  ];

  const allItems = [...rItems, ...srItems, ...ssrItems];
  const createdItems: Item[] = [];

  for (const item of allItems) {
    const created = await prisma.item.create({
      data: item,
    });
    createdItems.push(created);
  }
  console.log(`✅ 创建了 ${createdItems.length} 个物品`);

  // 创建掉落表
  // R级权重: 70% (总权重1000，R占700)
  // SR级权重: 25% (250)
  // SSR级权重: 5% (50)

  const rItemsCreated = createdItems.filter(i => i.rarity === Rarity.R);
  const srItemsCreated = createdItems.filter(i => i.rarity === Rarity.SR);
  const ssrItemsCreated = createdItems.filter(i => i.rarity === Rarity.SSR);

  // R级物品，每个权重 140 (700/5 = 140)
  for (const item of rItemsCreated) {
    await prisma.gameLootTable.create({
      data: {
        gameCode: game.code,
        itemId: item.id,
        weight: 140,
        isGuaranteed: false,
      },
    });
  }

  // SR级物品，每个权重 125 (250/2 = 125)
  for (const item of srItemsCreated) {
    await prisma.gameLootTable.create({
      data: {
        gameCode: game.code,
        itemId: item.id,
        weight: 125,
        isGuaranteed: false,
      },
    });
  }

  // SSR级物品，每个权重 16-17 (50/3 ≈ 17)，保底池
  for (const item of ssrItemsCreated) {
    await prisma.gameLootTable.create({
      data: {
        gameCode: game.code,
        itemId: item.id,
        weight: 17,
        isGuaranteed: true, // SSR物品在保底池中
      },
    });
  }

  console.log('✅ 掉落表创建完成');
  console.log('🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


