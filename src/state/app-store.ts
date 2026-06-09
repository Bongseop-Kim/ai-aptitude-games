import { create } from 'zustand';

export type SmokeTab = 'home' | 'games' | 'reports';
export type BottomNavValue = 'home' | 'games' | 'reports' | 'me';

type AppState = {
  nav: BottomNavValue;
  setNav: (nav: BottomNavValue) => void;
  setTab: (tab: SmokeTab) => void;
  tab: SmokeTab;
};

export const useAppStore = create<AppState>((set) => ({
  nav: 'home',
  setNav: (nav) => set({ nav }),
  setTab: (tab) => set({ tab }),
  tab: 'home',
}));
