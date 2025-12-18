import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = registerSchema.parse(req.body);

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return next(new AppError('用户名已存在', 400));
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        coinsBalance: 100, // 初始100金币
        ticketsBalance: 0,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        coinsBalance: true,
        ticketsBalance: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('请求参数错误: ' + error.errors[0].message, 400));
    }
    next(error);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return next(new AppError('用户名或密码错误', 401));
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(new AppError('用户名或密码错误', 401));
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          coinsBalance: user.coinsBalance,
          ticketsBalance: user.ticketsBalance,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('请求参数错误: ' + error.errors[0].message, 400));
    }
    next(error);
  }
});

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as import('../middleware/auth').AuthRequest;
    const userId = authReq.userId!;

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

export default router;


