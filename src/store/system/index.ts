import { create } from 'zustand';

type SystemState = {
  isLoading: boolean;
  setSpinner: (loading: boolean) => void;
};

export const useSystemStore = create<SystemState>((set) => ({
  isLoading: false,
  setSpinner: (loading) => set({ isLoading: loading }),
}));
