import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { gameApi, userApi } from '../../services/api';
import type { Game } from '../../types';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { motion } from 'framer-motion';

export default function LobbyPage() {
  const { user, updateCoins } = useUserStore();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  useEffect(() => {
    loadGames();
    loadUser();
  }, []);

  const loadGames = async () => {
    try {
      const response = await gameApi.getGames();
      setGames(response.data.data);
    } catch (error) {
      console.error('加载游戏失败:', error);
    }
  };

  const loadUser = async () => {
    try {
      const response = await userApi.getMe();
      useUserStore.getState().setUser(response.data.data);
    } catch (error: any) {
      console.error('加载用户信息失败:', error);
      if (error.response?.status === 401) {
        // Token过期，跳转到登录页
        useUserStore.getState().logout();
        window.location.href = '/login';
      }
    }
  };

  const handleCheckin = async () => {
    if (checkinLoading) return;
    
    setCheckinLoading(true);
    try {
      const response = await userApi.checkin();
      updateCoins(response.data.data.coinsBalance);
      setCheckinSuccess(true);
      setTimeout(() => setCheckinSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || '签到失败');
    } finally {
      setCheckinLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* 功能按钮区 */}
        <div className="flex gap-4 mb-8 justify-center">
          <Button
            variant="neon"
            size="lg"
            onClick={handleCheckin}
            disabled={checkinLoading || checkinSuccess}
          >
            {checkinSuccess ? '✅ 今日已签到 +50💰' : checkinLoading ? '签到中...' : '📅 每日签到'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/inventory')}
          >
            🎒 我的背包
          </Button>
        </div>

        {/* 机台展示区 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center text-shadow-neon" style={{ color: '#ff00ff' }}>
            游戏机台
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <motion.div
                key={game.code}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="p-6 text-center"
                  onClick={() => {
                    if (game.code === 'SLOTS_01' && game.isActive) {
                      navigate('/slots');
                    }
                  }}
                >
                  <div className="text-6xl mb-4">🎰</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-gray-400 mb-4">每次消耗 {game.costPerPlay} 💰</p>
                  {game.isActive ? (
                    <Button variant="primary" className="w-full">
                      开始游戏
                    </Button>
                  ) : (
                    <div className="bg-gray-700 text-gray-400 py-2 rounded-lg">
                      装修中...
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
            
            {/* 占位机台 - 装修中 */}
            {games.length < 3 && (
              <>
                {Array.from({ length: 3 - games.length }).map((_, idx) => (
                  <Card key={`placeholder-${idx}`} className="p-6 text-center opacity-50">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">机台 {idx + 2}</h3>
                    <div className="bg-gray-700 text-gray-400 py-2 rounded-lg">
                      装修中...
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


