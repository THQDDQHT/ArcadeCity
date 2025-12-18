import { create } from 'zustand';
import type { Item } from '../types';

interface GameState {
  isPlaying: boolean;
  currentReward: Item | null;
  setIsPlaying: (playing: boolean) => void;
  setCurrentReward: (item: Item | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  currentReward: null,
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentReward: (item) => set({ currentReward: item }),
}));


