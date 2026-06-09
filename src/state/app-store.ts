import { create } from 'zustand';

export type SmokeTab = 'home' | 'games' | 'reports';
export type BottomNavValue = SmokeTab | 'me';

type AppState = {
  setTab: (tab: BottomNavValue) => void;
  tab: BottomNavValue;
};

export const useAppStore = create<AppState>((set) => ({
  setTab: (tab) => set({ tab }),
  tab: 'home',
}));
