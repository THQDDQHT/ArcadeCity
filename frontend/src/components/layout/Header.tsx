import { useUserStore } from '../../stores/userStore';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function Header() {
  const { user } = useUserStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="w-full bg-gray-900 border-b-2 border-neon-purple p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full bg-neon-pink cursor-pointer hover:scale-110 transition-transform"
            onClick={() => navigate('/lobby')}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.username}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">💰</span>
            <span className="text-white font-bold">{user.coinsBalance}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">🎫</span>
            <span className="text-white font-bold">{user.ticketsBalance}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/inventory')}>
            我的背包
          </Button>
        </div>
      </div>
    </header>
  );
}


