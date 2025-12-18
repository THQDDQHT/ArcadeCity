import { create } from 'zustand';
import type { UserInventory } from '../types';

interface InventoryState {
  items: UserInventory[];
  setItems: (items: UserInventory[]) => void;
  addItem: (item: UserInventory) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  
  setItems: (items) => set({ items }),
  
  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
    })),
}));


