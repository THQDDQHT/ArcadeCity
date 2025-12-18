import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// 获取背包列表
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId!;
    const { rarity, type } = req.query;

    const where: any = {
      userId,
    };

    // 如果提供了筛选条件
    if (rarity || type) {
      where.item = {};
      if (rarity) {
        where.item.rarity = rarity;
      }
      if (type) {
        where.item.type = type;
      }
    }

    const inventory = await prisma.userInventory.findMany({
      where,
      include: {
        item: true,
      },
      orderBy: {
        obtainedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


