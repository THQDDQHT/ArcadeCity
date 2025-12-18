import Reel from './Reel';
import type { Item } from '../../types';

interface SlotStageProps {
  items: Item[];
  targetItems: Item[];
  isSpinning: boolean;
  shouldSkip?: boolean;
}

export default function SlotStage({ items, targetItems, isSpinning, shouldSkip = false }: SlotStageProps) {
  // 三个滚轮的停止延迟：0s, 0.3s, 0.6s
  const stopDelays = [0, 0.3, 0.6];
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-4 border-purple-500 shadow-2xl shadow-purple-500/20 p-8 relative overflow-hidden">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative grid grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((index) => (
          <Reel
            key={index}
            items={items}
            targetItem={targetItems[index] || null}
            isSpinning={isSpinning}
            index={index}
            stopDelay={stopDelays[index]}
            shouldSkip={shouldSkip}
          />
        ))}
      </div>
      
      {/* 底部装饰文字 */}
      <div className="relative text-center text-gray-500 text-sm mt-4">
        🎰 转动滚轮，赢取奖励 🎰
      </div>
    </div>
  );
}


