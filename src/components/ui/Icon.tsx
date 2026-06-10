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
  add: 'add',
  'arrow-forward': 'arrow-forward',
  'arrow-left': 'arrow-back',
  bell: 'notifications',
  check: 'check',
  'chevron-right': 'chevron-right',
  clock: 'schedule',
  close: 'close',
  adjust: 'adjust',
  balance: 'balance',
  controller: 'sports-esports',
  diamond: 'diamond',
  dialpad: 'dialpad',
  doc: 'description',
  eco: 'eco',
  edit: 'edit',
  extension: 'extension',
  fire: 'local-fire-department',
  flask: 'science',
  'group-add': 'group-add',
  groups: 'groups',
  hand: 'front-hand',
  help: 'help-outline',
  lock: 'lock',
  logout: 'logout',
  paw: 'pets',
  play: 'play-arrow',
  profile: 'person',
  rank: 'leaderboard',
  report: 'insights',
  rotate: 'rotate-right',
  settings: 'settings',
  share: 'ios-share',
  timeline: 'timeline',
  'trend-up': 'trending-up',
  trophy: 'emoji-events',
  volume: 'volume-up',
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
