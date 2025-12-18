import { useState, useCallback, useRef } from 'react';
import { gameApi } from '../../services/api';
import { useUserStore } from '../../stores/userStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useGameStore } from '../../stores/gameStore';
import type { Item, Rarity } from '../../types';

export type GameState = 'idle' | 'spinning' | 'result';

export function useSlotGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reward, setReward] = useState<Item | null>(null);
  const [targetItems, setTargetItems] = useState<Item[]>([]);
  const [shouldSkip, setShouldSkip] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user, updateCoins } = useUserStore();
  const { addItem } = useInventoryStore();
  const { setIsPlaying, setCurrentReward } = useGameStore();

  const play = useCallback(async () => {
    if (!user || user.coinsBalance < 10 || gameState !== 'idle') {
      return;
    }

    setGameState('spinning');
    setShouldSkip(false);
    setIsPlaying(true);

    // 清除之前的定时器
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    try {
      const response = await gameApi.playSlots();
      const result = response.data.data;
      
      // 设置目标物品（三个滚轮显示相同物品）
      setTargetItems([result.rewardItem, result.rewardItem, result.rewardItem]);
      setReward(result.rewardItem);
      
      // 更新余额
      updateCoins(result.remainingCoins);
      
      // 添加到背包（使用API返回的数据构建）
      addItem({
        id: (result as any).inventoryId || Date.now(),
        userId: user.id,
        itemId: result.rewardItem.id,
        obtainedAt: new Date().toISOString(),
        isConsumed: false,
        sourceGameCode: 'SLOTS_01',
        item: result.rewardItem,
      });

      // 等待动画完成后再设置为result状态
      // 最长等待时间 = 基础时长(2.5s) + 最后一个滚轮延迟(0.6s) + 缓冲(0.2s) = 3.3s
      animationTimeoutRef.current = setTimeout(() => {
        setGameState('result');
        setCurrentReward(result.rewardItem);
      }, 3300);
    } catch (error: any) {
      // 更友好的错误处理
      const errorMessage = error.response?.data?.message || '抽奖失败，请稍后重试';
      console.error('抽奖错误:', error);
      
      // 根据错误类型显示不同消息
      let userMessage = errorMessage;
      if (error.response?.status === 400) {
        userMessage = errorMessage || '金币不足或请求参数错误';
      } else if (error.response?.status === 401) {
        userMessage = '登录已过期，请重新登录';
      } else if (error.response?.status >= 500) {
        userMessage = '服务器错误，请稍后重试';
      }
      
      // 使用更友好的提示方式（可以后续替换为Toast组件）
      alert(userMessage);
      setGameState('idle');
      setIsPlaying(false);
      setShouldSkip(false);
      
      // 清理定时器
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    }
  }, [user, gameState, updateCoins, addItem, setIsPlaying, setCurrentReward]);

  const skipAnimation = useCallback(() => {
    if (gameState === 'spinning') {
      setShouldSkip(true);
      // 清除定时器，立即显示结果
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      // 短暂延迟后显示结果，让动画快速完成
      setTimeout(() => {
        setGameState('result');
        if (reward) {
          setCurrentReward(reward);
        }
      }, 200);
    }
  }, [gameState, reward, setCurrentReward]);

  const reset = useCallback(() => {
    setGameState('idle');
    setReward(null);
    setTargetItems([]);
    setShouldSkip(false);
    setIsPlaying(false);
    setCurrentReward(null);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, [setIsPlaying, setCurrentReward]);

  return {
    gameState,
    reward,
    targetItems,
    play,
    reset,
    skipAnimation,
    shouldSkip,
    canPlay: user ? user.coinsBalance >= 10 : false,
  };
}


