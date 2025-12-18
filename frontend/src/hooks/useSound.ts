import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSoundStore } from '../stores/soundStore';

// 音效文件路径
// 请将音频文件放置在 frontend/public/sounds/ 目录下
// 支持的音频格式：mp3, ogg, wav
const SOUNDS = {
  coin: '/sounds/coin.mp3',
  spin: '/sounds/spin.mp3',
  win: '/sounds/win.mp3',
  ssr: '/sounds/ssr.mp3',
  background: '/sounds/background.mp3',
};

// 停止转动音效
function stopSpinSound(soundsRef: { [key: string]: Howl }): void {
  const spinSound = soundsRef['spin'];
  if (spinSound && spinSound.playing()) {
    spinSound.stop();
  }
}

export function useSound() {
  const { enabled } = useSoundStore();
  const soundsRef = useRef<{ [key: string]: Howl }>({});
  const backgroundMusicRef = useRef<Howl | null>(null);
  const soundFilesLoadedRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    // 加载音效文件
    // 如果文件不存在，会在控制台显示提示，但不会报错
    Object.entries(SOUNDS).forEach(([key, src]) => {
      try {
        if (key === 'background') {
          const howl = new Howl({
            src: [src],
            loop: true,
            volume: 0.3,
            onloaderror: () => {
              soundFilesLoadedRef.current[key] = false;
            },
            onload: () => {
              soundFilesLoadedRef.current[key] = true;
            },
          });
          backgroundMusicRef.current = howl;
        } else {
          const howl = new Howl({
            src: [src],
            volume: 0.5,
            loop: key === 'spin', // 转动音效循环播放
            onloaderror: () => {
              soundFilesLoadedRef.current[key] = false;
              // 静默处理，不显示错误（文件不存在是正常的）
            },
            onload: () => {
              soundFilesLoadedRef.current[key] = true;
            },
          });
          soundsRef.current[key] = howl;
        }
      } catch (error) {
        console.warn(`Failed to load sound: ${key}`, error);
        soundFilesLoadedRef.current[key] = false;
      }
    });

    return () => {
      // 清理音效 - 确保立即停止所有音效
      stopSpinSound(soundsRef.current);
      Object.values(soundsRef.current).forEach(sound => {
        try {
          sound.stop();
          sound.unload();
        } catch (e) {
          // 忽略清理错误
        }
      });
      if (backgroundMusicRef.current) {
        try {
          backgroundMusicRef.current.stop();
          backgroundMusicRef.current.unload();
        } catch (e) {
          // 忽略清理错误
        }
      }
    };
  }, []);

  const playSound = (name: keyof typeof SOUNDS) => {
    if (!enabled) return;
    
    try {
      // 如果播放 win 或 ssr，先停止转动音效
      if (name === 'win' || name === 'ssr') {
        stopSpinSound(soundsRef.current);
      }
      
      if (name === 'background') {
        if (backgroundMusicRef.current) {
          if (soundFilesLoadedRef.current[name]) {
            if (!backgroundMusicRef.current.playing()) {
              backgroundMusicRef.current.play();
            }
          }
        }
      } else {
        const sound = soundsRef.current[name];
        // 只播放已加载的音频文件
        // 如果文件不存在，静默处理（不播放任何声音）
        // 用户可以将音频文件放置在 public/sounds/ 目录下：
        // - coin.mp3 (投币音效)
        // - spin.mp3 (转动音效，会自动循环)
        // - win.mp3 (中奖音效)
        // - ssr.mp3 (SSR音效)
        if (sound && soundFilesLoadedRef.current[name]) {
          sound.play();
        }
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${name}`, error);
    }
  };

  const stopSound = (name: 'background' | 'spin') => {
    if (name === 'background') {
      if (backgroundMusicRef.current && soundFilesLoadedRef.current[name]) {
        backgroundMusicRef.current.stop();
      }
    } else if (name === 'spin') {
      stopSpinSound(soundsRef.current);
    }
  };

  return { playSound, stopSound };
}
