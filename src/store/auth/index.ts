import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { API_BASE_URL } from '@/config';
import type { AuthState } from '@/types';

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isSessionLoading: true,
      _hasHydrated: false,

      setHasHydrated: (value) => {
        set({ _hasHydrated: value });
      },

      signIn: (accessToken, refreshToken, user) =>
        set(() => ({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user,
        })),

      signOut: () => {
        set(() => ({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        }));
      },

      checkSession: async () => {
        try {
          set({ isSessionLoading: true });

          const { refreshToken } = get();

          if (!refreshToken) {
            set({ isAuthenticated: false });
            return;
          }

          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

          set({
            isAuthenticated: true,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            user: response.data.user,
          });
        } catch {
          set({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            user: null,
          });
        } finally {
          set({ isSessionLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        getItem: (key: string) => SecureStore.getItemAsync(key),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      })),

      partialize: (state) =>
        ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: state.user,
        }) as AuthState,

      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);

          if (state?.refreshToken) {
            state.checkSession();
          } else {
            useAuthStore.setState({ isSessionLoading: false });
          }
        };
      },
    }
  )
);
