import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin' | 'both';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: Cookies.get('access_token') || null,
  isAuthenticated: !!Cookies.get('access_token'),

  setAuth: (user, token) => {
    Cookies.set('access_token', token, { expires: 1 }); // 1 day
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));