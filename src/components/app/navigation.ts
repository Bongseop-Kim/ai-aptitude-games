import type { BottomNavItem } from '../ui/BottomNav';

export const bottomNavItems: Array<BottomNavItem<'home' | 'games' | 'reports' | 'me'>> = [
  { icon: 'eco', label: '홈', value: 'home' },
  { icon: 'game', label: '게임', value: 'games' },
  { icon: 'report', label: '기록', value: 'reports' },
  { icon: 'profile', label: '내 정보', value: 'me' },
];
