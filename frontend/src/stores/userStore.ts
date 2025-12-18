import { create } from 'zustand';
import type { User } from '../types';

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  updateCoins: (coins: number) => void;
  updateTickets: (tickets: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  
  updateCoins: (coins) =>
    set((state) => ({
      user: state.user ? { ...state.user, coinsBalance: coins } : null,
    })),
  
  updateTickets: (tickets) =>
    set((state) => ({
      user: state.user ? { ...state.user, ticketsBalance: tickets } : null,
    })),
}));


