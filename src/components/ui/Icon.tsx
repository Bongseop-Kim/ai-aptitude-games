import type { ComponentProps } from 'react';

import { Text } from '../../design-system/components/Text';

export type IconName =
  | 'arrow-left'
  | 'bell'
  | 'calendar'
  | 'check'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'eco'
  | 'fire'
  | 'game'
  | 'lock'
  | 'profile'
  | 'rank'
  | 'report'
  | 'settings'
  | 'share'
  | 'star';

export type IconProps = {
  name: IconName;
  color?: ComponentProps<typeof Text>['color'];
  size?: 'small' | 'medium' | 'large';
};

const iconGlyph: Record<IconName, string> = {
  'arrow-left': '<',
  bell: '!',
  calendar: '#',
  check: '✓',
  'chevron-right': '>',
  clock: '@',
  close: 'x',
  eco: '*',
  fire: '^',
  game: '+',
  lock: 'L',
  profile: 'P',
  rank: 'R',
  report: '%',
  settings: '=',
  share: '/',
  star: '*',
};

const iconTextStyle = {
  small: 't3Bold',
  medium: 't5Bold',
  large: 't7Bold',
} as const;

export function Icon({ name, color = 'fg.neutralMuted', size = 'medium' }: IconProps) {
  return (
    <Text color={color} textStyle={iconTextStyle[size]} maxLines={1}>
      {iconGlyph[name]}
    </Text>
  );
}
