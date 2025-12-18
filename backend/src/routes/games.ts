import express from 'express';
import { PrismaClient, Rarity } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有游戏
router.get('/', async (req, res, next) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    next(error);
  }
});

// 获取游戏的所有可能奖品（用于前端滚轮显示）
router.get('/slots/items', async (req, res, next) => {
  try {
    const GAME_CODE = 'SLOTS_01';
    
    // 获取该游戏的所有掉落物品
    const lootEntries = await prisma.gameLootTable.findMany({
      where: {
        gameCode: GAME_CODE,
      },
      include: {
        item: true,
      },
    });

    // 提取所有唯一的物品
    const uniqueItems = Array.from(
      new Map(lootEntries.map(entry => [entry.item.id, entry.item])).values()
    );

    res.json({
      success: true,
      data: uniqueItems,
    });
  } catch (error) {
    next(error);
  }
});

// 老虎机抽奖（核心接口）
router.post('/slots/play', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId!;
    const GAME_CODE = 'SLOTS_01';
    const COST_PER_PLAY = 10;

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 检查用户余额
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { coinsBalance: true },
      });

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      if (user.coinsBalance < COST_PER_PLAY) {
        throw new AppError('金币不足', 400);
      }

      // 2. 扣除费用
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coinsBalance: {
            decrement: COST_PER_PLAY,
          },
        },
        select: {
          coinsBalance: true,
        },
      });

      // 3. 记录交易
      await tx.transaction.create({
        data: {
          userId,
          amount: -COST_PER_PLAY,
          currencyType: 'COIN',
          reason: 'GAME_PLAY',
        },
      });

      // 4. 检查保底机制
      // 查询最近9次抽奖记录（不包括本次）
      const recentDraws = await tx.userInventory.findMany({
        where: {
          userId,
          sourceGameCode: GAME_CODE,
        },
        include: {
          item: true,
        },
        orderBy: {
          obtainedAt: 'desc',
        },
        take: 9,
      });

      // 检查最近9次是否有SR或SSR
      const hasHighRarity = recentDraws.some(
        (draw) => draw.item.rarity === Rarity.SR || draw.item.rarity === Rarity.SSR
      );

      let selectedItem;

      if (!hasHighRarity) {
        // 保底：强制从SR/SSR池抽取
        const highRarityItems = await tx.gameLootTable.findMany({
          where: {
            gameCode: GAME_CODE,
            item: {
              rarity: {
                in: [Rarity.SR, Rarity.SSR],
              },
            },
          },
          include: {
            item: true,
          },
        });

        if (highRarityItems.length === 0) {
          throw new AppError('高稀有度物品池为空', 500);
        }

        // 从高稀有度池中随机选择
        const totalWeight = highRarityItems.reduce(
          (sum, entry) => sum + entry.weight,
          0
        );
        let random = Math.random() * totalWeight;

        for (const entry of highRarityItems) {
          random -= entry.weight;
          if (random <= 0) {
            selectedItem = entry.item;
            break;
          }
        }
      } else {
        // 正常抽奖：根据权重加权随机
        const allLootEntries = await tx.gameLootTable.findMany({
          where: {
            gameCode: GAME_CODE,
          },
          include: {
            item: true,
          },
        });

        if (allLootEntries.length === 0) {
          throw new AppError('掉落表为空', 500);
        }

        const totalWeight = allLootEntries.reduce(
          (sum, entry) => sum + entry.weight,
          0
        );
        let random = Math.random() * totalWeight;

        for (const entry of allLootEntries) {
          random -= entry.weight;
          if (random <= 0) {
            selectedItem = entry.item;
            break;
          }
        }
      }

      if (!selectedItem) {
        throw new AppError('抽奖失败', 500);
      }

      // 5. 将物品添加到背包
      const inventoryEntry = await tx.userInventory.create({
        data: {
          userId,
          itemId: selectedItem.id,
          sourceGameCode: GAME_CODE,
        },
        include: {
          item: true,
        },
      });

      return {
        rewardItem: selectedItem,
        remainingCoins: updatedUser.coinsBalance,
        isPityTriggered: !hasHighRarity,
        inventoryId: inventoryEntry.id,
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

