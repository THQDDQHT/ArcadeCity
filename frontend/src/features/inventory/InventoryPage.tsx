import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useUserStore } from '../../stores/userStore';
import { inventoryApi } from '../../services/api';
import type { UserInventory, ItemType, Rarity } from '../../types';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function InventoryPage() {
  const { items, setItems } = useInventoryStore();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<UserInventory | null>(null);
  const [filterRarity, setFilterRarity] = useState<Rarity | ''>('');
  const [filterType, setFilterType] = useState<ItemType | ''>('');

  useEffect(() => {
    loadInventory();
  }, [filterRarity, filterType]);

  const loadInventory = async () => {
    try {
      const response = await inventoryApi.getInventory(
        filterRarity || undefined,
        filterType || undefined
      );
      setItems(response.data.data);
    } catch (error: any) {
      console.error('加载背包失败:', error);
      if (error.response?.status === 401) {
        useUserStore.getState().logout();
        navigate('/login');
      } else {
        alert('加载背包失败，请稍后重试');
      }
    }
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'R':
        return 'border-gray-500 text-gray-300';
      case 'SR':
        return 'border-blue-400 text-blue-300';
      case 'SSR':
        return 'border-yellow-400 text-yellow-300 box-shadow-neon-pink';
      default:
        return 'border-gray-500';
    }
  };

  const renderItemContent = (item: UserInventory) => {
    switch (item.item.type) {
      case 'PHOTO':
        return (
          <div className="text-center">
            <img
              src={item.item.content}
              alt={item.item.title}
              className="max-w-full max-h-96 mx-auto rounded-lg mb-4"
            />
            {item.item.description && (
              <p className="text-gray-300">{item.item.description}</p>
            )}
          </div>
        );
      case 'TEXT':
        return (
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💌</div>
            <p className="text-xl text-white mb-4">{item.item.content}</p>
            {item.item.description && (
              <p className="text-gray-400">{item.item.description}</p>
            )}
          </div>
        );
      case 'COUPON':
        return (
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-white mb-4">{item.item.title}</h3>
            <p className="text-lg text-gray-300 mb-4">{item.item.content}</p>
            {item.item.description && (
              <p className="text-gray-400">{item.item.description}</p>
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
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
            我的背包
          </h1>
          <Button variant="secondary" onClick={() => navigate('/lobby')}>
            返回大厅
          </Button>
        </div>

        {/* 筛选器 */}
        <div className="mb-6 flex gap-4">
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as Rarity | '')}
            className="px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
          >
            <option value="">全部稀有度</option>
            <option value="R">R</option>
            <option value="SR">SR</option>
            <option value="SSR">SSR</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ItemType | '')}
            className="px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
          >
            <option value="">全部类型</option>
            <option value="PHOTO">照片</option>
            <option value="TEXT">文字</option>
            <option value="COUPON">券</option>
          </select>
        </div>

        {/* 物品网格 */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400 text-xl">背包空空如也，快去抽奖吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedItem(item)}
              >
                <div className={`border-2 rounded-lg p-2 ${getRarityColor(item.item.rarity)}`}>
                  {item.item.type === 'PHOTO' ? (
                    <img
                      src={item.item.content}
                      alt={item.item.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  ) : item.item.type === 'TEXT' ? (
                    <div className="h-32 flex items-center justify-center">
                      <span className="text-4xl">💌</span>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <span className="text-4xl">🎟️</span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className={`text-xs font-bold ${getRarityColor(item.item.rarity)}`}>
                      {item.item.rarity}
                    </div>
                    {item.item.title && (
                      <div className="text-sm text-white truncate mt-1">
                        {item.item.title}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 物品详情模态框 */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.item.title || '物品详情'}
      >
        {selectedItem && (
          <div>
            <div className={`mb-4 text-center p-4 rounded-lg border-2 ${getRarityColor(selectedItem.item.rarity)}`}>
              <div className="text-2xl font-bold mb-2">稀有度: {selectedItem.item.rarity}</div>
              <div className="text-sm text-gray-400">
                获得时间: {new Date(selectedItem.obtainedAt).toLocaleString('zh-CN')}
              </div>
            </div>
            {renderItemContent(selectedItem)}
          </div>
        )}
      </Modal>
    </div>
  );
}


