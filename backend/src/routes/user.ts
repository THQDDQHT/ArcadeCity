import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取用户信息
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        coinsBalance: true,
        ticketsBalance: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// 每日签到
router.post('/checkin', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId!;

    // 检查今日是否已签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckin = await prisma.transaction.findFirst({
      where: {
        userId,
        reason: 'DAILY_CHECKIN',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (todayCheckin) {
      return next(new AppError('今日已签到', 400));
    }

    // 发放50金币
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        coinsBalance: {
          increment: 50,
        },
      },
      select: {
        coinsBalance: true,
        ticketsBalance: true,
      },
    });

    // 记录交易
    await prisma.transaction.create({
      data: {
        userId,
        amount: 50,
        currencyType: 'COIN',
        reason: 'DAILY_CHECKIN',
      },
    });

    res.json({
      success: true,
      data: {
        coinsEarned: 50,
        coinsBalance: user.coinsBalance,
        ticketsBalance: user.ticketsBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


