import { create } from 'zustand';

interface SoundState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  enabled: localStorage.getItem('soundEnabled') !== 'false',
  
  toggle: () =>
    set((state) => {
      const newValue = !state.enabled;
      localStorage.setItem('soundEnabled', String(newValue));
      return { enabled: newValue };
    }),
  
  setEnabled: (enabled) => {
    localStorage.setItem('soundEnabled', String(enabled));
    set({ enabled });
  },
}));


