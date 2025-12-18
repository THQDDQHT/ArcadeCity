export enum ItemType {
  PHOTO = 'PHOTO',
  TEXT = 'TEXT',
  COUPON = 'COUPON',
}

export enum Rarity {
  R = 'R',
  SR = 'SR',
  SSR = 'SSR',
}

export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  coinsBalance: number;
  ticketsBalance: number;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface Item {
  id: number;
  type: ItemType;
  rarity: Rarity;
  title?: string;
  content: string;
  description?: string;
  isHidden?: boolean;
}

export interface UserInventory {
  id: number;
  userId: number;
  itemId: number;
  obtainedAt: string;
  isConsumed: boolean;
  sourceGameCode?: string;
  item: Item;
}

export interface Game {
  code: string;
  name: string;
  costPerPlay: number;
  isActive: boolean;
}

export interface SlotPlayResponse {
  rewardItem: Item;
  remainingCoins: number;
  isPityTriggered: boolean;
}

export interface CheckinResponse {
  coinsEarned: number;
  coinsBalance: number;
  ticketsBalance: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


