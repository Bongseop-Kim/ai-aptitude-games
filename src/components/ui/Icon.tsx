import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useDesignSystemTheme } from '../../design-system/provider';
import { resolveColor } from '../../design-system/components/style-props';
import type { ColorToken } from '../../design-system/components/style-props';
import type { IconName } from '../../shared/types';

export type { IconName } from '../../shared/types';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type IconProps = {
  name: IconName;
  color?: ColorToken;
  size?: 'small' | 'medium' | 'large';
};

const materialIconName: Record<IconName, MaterialIconName> = {
  'arrow-left': 'arrow-back',
  bell: 'notifications',
  calendar: 'calendar-today',
  check: 'check',
  'chevron-right': 'chevron-right',
  clock: 'schedule',
  close: 'close',
  eco: 'eco',
  fire: 'local-fire-department',
  game: 'sports-esports',
  lock: 'lock',
  profile: 'person',
  rank: 'leaderboard',
  report: 'insights',
  settings: 'settings',
  share: 'ios-share',
  star: 'star',
};

const iconSizeToken = {
  small: 'x5',
  medium: 'x6',
  large: 'x8',
} as const;

export function Icon({ name, color = 'fg.neutralMuted', size = 'medium' }: IconProps) {
  const { theme } = useDesignSystemTheme();
  const resolvedColor = resolveColor(theme, color) ?? color;

  return (
    <MaterialIcons
      color={resolvedColor}
      name={materialIconName[name]}
      size={theme.dimension.x[iconSizeToken[size]]}
    />
  );
}
