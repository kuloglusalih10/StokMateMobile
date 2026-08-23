import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { API_BASE_URL } from '@/config';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  isSessionLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => void;
  signOut: () => void;
  checkSession: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isSessionLoading: true,
      _hasHydrated: false,

      setHasHydrated: (value) => {
        set({ _hasHydrated: value });
      },

      signIn: (access, refresh) =>
        set(() => ({
          isAuthenticated: true,
          accessToken: access,
          refreshToken: refresh,
        })),

      signOut: () => {
        set(() => ({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
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

          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000,
            }
          );

          if (response?.data) {
            set({
              isAuthenticated: true,
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
            });
          } else {
            throw new Error('Token yenilenemedi');
          }
        } catch {
          set({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
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
