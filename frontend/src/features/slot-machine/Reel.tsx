import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Item } from '../../types';

interface ReelProps {
  items: Item[];
  targetItem: Item | null;
  isSpinning: boolean;
  index: number;
  stopDelay?: number; // 停止延迟（秒）
  shouldSkip?: boolean; // 是否应该跳过
}

const ITEM_HEIGHT = 120; // 每个物品的高度（px）
const BASE_DURATION = 2.5; // 基础动画时长（秒）

export default function Reel({ items, targetItem, isSpinning, index, stopDelay = 0, shouldSkip = false }: ReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!reelRef.current || !targetItem) return;

    const reel = reelRef.current;
    const targetIndex = items.findIndex(item => item.id === targetItem.id);
    
    if (targetIndex === -1) return;

    if (isSpinning && animationRef.current) {
      // 重置动画
      animationRef.current.kill();
    }

    if (isSpinning) {
      // 创建Fake Loop：复制物品数组
      const loopItems = [...items, ...items, ...items];
      const totalHeight = loopItems.length * ITEM_HEIGHT;
      
      // 计算目标位置（在中间的那组数组中）
      const targetY = -(items.length * ITEM_HEIGHT + targetIndex * ITEM_HEIGHT);
      
      // 先快速滚动（模拟旋转）
      gsap.set(reel, { y: -totalHeight / 3 });
      
      // 滚动到目标位置，带物理回弹效果
      // 每个滚轮有不同的停止延迟，营造真实感
      animationRef.current = gsap.to(reel, {
        y: targetY,
        duration: BASE_DURATION + stopDelay,
        delay: stopDelay,
        ease: 'back.out(1.2)', // 回弹效果
        onComplete: () => {
          // 重置位置到可视区域
          gsap.set(reel, { y: -targetIndex * ITEM_HEIGHT });
        },
      });
    }
  }, [isSpinning, targetItem, items, index, stopDelay]);

  // 处理快速跳过
  useEffect(() => {
    if (shouldSkip && animationRef.current && reelRef.current && targetItem) {
      const reel = reelRef.current;
      const targetIndex = items.findIndex(item => item.id === targetItem.id);
      
      if (targetIndex !== -1) {
        // 立即停止当前动画
        animationRef.current.kill();
        
        // 快速移动到目标位置
        gsap.to(reel, {
          y: -targetIndex * ITEM_HEIGHT,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }
  }, [shouldSkip, targetItem, items]);

  // 渲染物品（Fake Loop: 三组相同的物品）
  const renderItems = () => {
    const loopItems = [...items, ...items, ...items];
    return loopItems.map((item, idx) => (
      <div
        key={`${item.id}-${idx}`}
        className="flex-shrink-0 h-[120px] flex items-center justify-center bg-gray-800 border border-gray-700"
        style={{ height: `${ITEM_HEIGHT}px` }}
      >
        {item.type === 'PHOTO' ? (
          <img
            src={item.content}
            alt={item.title}
            className="max-w-full max-h-full object-contain"
          />
        ) : item.type === 'TEXT' ? (
          <div className="text-center p-2">
            <div className="text-2xl">💌</div>
            <div className="text-xs text-white truncate">{item.content}</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl">🎟️</div>
            <div className="text-xs text-white">{item.title}</div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="relative w-full h-[120px] overflow-hidden border-2 border-gray-600 rounded-lg bg-gray-900 shadow-lg hover:border-purple-500 transition-colors duration-300">
      <div
        ref={reelRef}
        className="absolute w-full"
        style={{
          willChange: 'transform',
          transform: 'translateY(0px)',
        }}
      >
        {renderItems()}
      </div>
      {/* 遮罩层，只显示中间一个物品 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[120px] bg-gradient-to-b from-gray-900 via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
        {/* 中间高亮指示线 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent transform -translate-y-1/2 opacity-50"></div>
      </div>
    </div>
  );
}


