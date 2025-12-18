import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SSREffectProps {
  show: boolean;
  onComplete: () => void;
}

export default function SSREffect({ show, onComplete }: SSREffectProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // 创建粒子（彩带）
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: ['#ff00ff', '#00ffff', '#ffff00', '#ff00ff', '#9d00ff'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);

      // 震动效果
      document.body.style.animation = 'shake 0.5s';
      
      // 3秒后完成
      const timer = setTimeout(() => {
        document.body.style.animation = '';
        onComplete();
      }, 3000);

      return () => {
        clearTimeout(timer);
        document.body.style.animation = '';
      };
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          {/* 闪光效果 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-50"
          />
          
          {/* 粒子/彩带 */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ y: particle.y, x: `${particle.x}%`, rotate: 0 }}
              animate={{ y: '110%', rotate: 360 }}
              transition={{
                duration: 2 + Math.random(),
                ease: 'easeOut',
              }}
              className="absolute w-4 h-20"
              style={{
                background: `linear-gradient(to bottom, ${particle.color}, transparent)`,
                boxShadow: `0 0 20px ${particle.color}`,
              }}
            />
          ))}
          
          {/* 中央文字 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-shadow-neon">
              SSR!
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
`;
if (!document.head.querySelector('style[data-ssr-effect]')) {
  style.setAttribute('data-ssr-effect', 'true');
  document.head.appendChild(style);
}


