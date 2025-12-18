import axios from 'axios';
import type {
  User,
  UserInventory,
  Game,
  SlotPlayResponse,
  CheckinResponse,
  ApiResponse,
  Item,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authApi = {
  register: (username: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      username,
      password,
    }),
  
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      username,
      password,
    }),
  
  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};

// 用户API
export const userApi = {
  getMe: () =>
    api.get<ApiResponse<User>>('/user/me'),
  
  checkin: () =>
    api.post<ApiResponse<CheckinResponse>>('/user/checkin'),
};

// 背包API
export const inventoryApi = {
  getInventory: (rarity?: string, type?: string) =>
    api.get<ApiResponse<UserInventory[]>>('/inventory', {
      params: { rarity, type },
    }),
};

// 游戏API
export const gameApi = {
  getGames: () =>
    api.get<ApiResponse<Game[]>>('/games'),
  
  getSlotItems: () =>
    api.get<ApiResponse<Item[]>>('/games/slots/items'),
  
  playSlots: () =>
    api.post<ApiResponse<SlotPlayResponse>>('/games/slots/play'),
};

export default api;


