import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSlotGame } from './useSlotGame';
import SlotStage from './SlotStage';
import SSREffect from './SSREffect';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import { gameApi as gameApiService } from '../../services/api';
import type { Item, Rarity } from '../../types';
import { useSound } from '../../hooks/useSound';

// 占位物品列表（用于滚轮显示）
const PLACEHOLDER_ITEMS: Item[] = [
  {
    id: 0,
    type: 'PHOTO',
    rarity: 'R',
    title: 'Placeholder',
    content: 'https://via.placeholder.com/100',
  },
];

export default function SlotMachinePage() {
  const navigate = useNavigate();
  const { gameState, reward, targetItems, play, reset, canPlay, skipAnimation, shouldSkip } = useSlotGame();
  const { playSound, stopSound } = useSound();
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showSSREffect, setShowSSREffect] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>(PLACEHOLDER_ITEMS);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (gameState === 'result' && reward) {
      // 检查是否是SSR
      if (reward.rarity === 'SSR') {
        setShowSSREffect(true);
        playSound('ssr');
      } else if (reward.rarity === 'SR') {
        playSound('win');
      } else {
        playSound('win');
      }
      setShowRewardModal(true);
    }
  }, [gameState, reward, playSound]);

  useEffect(() => {
    if (gameState === 'spinning') {
      playSound('spin');
    } else if (gameState === 'result' || gameState === 'idle') {
      // 停止转动音效
      stopSound('spin');
    }
  }, [gameState, playSound, stopSound]);

  const loadItems = async () => {
    try {
      // 从API获取老虎机的所有可能奖品
      const response = await gameApiService.getSlotItems();
      if (response.data.data.length > 0) {
        setAllItems(response.data.data);
      }
    } catch (error: any) {
      console.error('加载物品失败:', error);
      // 静默失败，使用占位物品
    }
  };

  const handlePlay = () => {
    if (canPlay && gameState === 'idle') {
      playSound('coin');
      play();
    }
  };

  const handleCloseReward = () => {
    setShowRewardModal(false);
    setShowSSREffect(false);
    // 确保停止所有音效
    stopSound('spin');
    reset();
    // 不需要重新加载物品，因为物品列表来自API
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'R':
        return 'text-gray-300';
      case 'SR':
        return 'text-blue-300';
      case 'SSR':
        return 'text-yellow-300';
      default:
        return 'text-gray-300';
    }
  };

  const renderRewardContent = () => {
    if (!reward) return null;

    switch (reward.type) {
      case 'PHOTO':
        return (
          <div className="text-center">
            <img
              src={reward.content}
              alt={reward.title}
              className="max-w-full max-h-96 mx-auto rounded-lg mb-4"
            />
            {reward.description && (
              <p className="text-gray-300">{reward.description}</p>
            )}
          </div>
        );
      case 'TEXT':
        return (
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💌</div>
            <p className="text-xl text-white mb-4">{reward.content}</p>
            {reward.description && (
              <p className="text-gray-400">{reward.description}</p>
            )}
          </div>
        );
      case 'COUPON':
        return (
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-white mb-4">{reward.title}</h3>
            <p className="text-lg text-gray-300 mb-4">{reward.content}</p>
            {reward.description && (
              <p className="text-gray-400">{reward.description}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Header />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
            🎰 老虎机
          </h1>
          <Button variant="secondary" onClick={() => navigate('/lobby')}>
            返回大厅
          </Button>
        </div>

        <Card className="p-8 mb-6">
          <SlotStage
            items={allItems.length > 0 ? allItems : PLACEHOLDER_ITEMS}
            targetItems={targetItems.length > 0 ? targetItems : [PLACEHOLDER_ITEMS[0], PLACEHOLDER_ITEMS[0], PLACEHOLDER_ITEMS[0]]}
            isSpinning={gameState === 'spinning'}
            shouldSkip={shouldSkip}
          />
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="neon"
              size="lg"
              onClick={handlePlay}
              disabled={!canPlay || gameState !== 'idle'}
              className="text-2xl px-12 py-6 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {gameState === 'spinning' ? '转动中...' : gameState === 'result' ? '查看奖励' : `投币开始 (消耗 10 💰)`}
            </Button>
            
            {gameState === 'spinning' && (
              <Button
                variant="secondary"
                size="lg"
                onClick={skipAnimation}
                className="text-xl px-8 py-4 animate-pulse"
              >
                ⚡ 快速跳过
              </Button>
            )}
          </div>
          
          {!canPlay && gameState === 'idle' && (
            <p className="text-red-400 mt-4">金币不足！需要至少 10 💰</p>
          )}
        </div>
      </div>

      {/* SSR全屏特效 */}
      <SSREffect
        show={showSSREffect}
        onComplete={() => setShowSSREffect(false)}
      />

      {/* 奖励展示模态框 */}
      <Modal
        isOpen={showRewardModal}
        onClose={handleCloseReward}
        title={`获得奖励: ${reward?.rarity}`}
      >
        {reward && (
          <div>
            <div className={`mb-4 text-center p-4 rounded-lg border-2 ${getRarityColor(reward.rarity)}`}>
              <div className="text-3xl font-bold mb-2">稀有度: {reward.rarity}</div>
              {reward.title && (
                <div className="text-xl text-white">{reward.title}</div>
              )}
            </div>
            {renderRewardContent()}
            <div className="mt-6 text-center">
              <Button variant="primary" onClick={handleCloseReward} className="w-full">
                继续游戏
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


