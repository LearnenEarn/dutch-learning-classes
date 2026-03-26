import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LanguagePref } from '@/types';
import { authApi } from '@/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLanguage: (lang: LanguagePref) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token, user) => {
        localStorage.setItem('dutch_app_token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('dutch_app_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      setLanguage: async (lang) => {
        await authApi.updateLanguage(lang);
        const user = get().user;
        if (user) {
          set({ user: { ...user, language_pref: lang } });
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('dutch_app_token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem('dutch_app_token');
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'dutch-app-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
