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
  bus: 'directions-bus',
  check: 'check',
  'chevron-right': 'chevron-right',
  clock: 'schedule',
  close: 'close',
  adjust: 'adjust',
  balance: 'balance',
  backspace: 'backspace',
  controller: 'sports-esports',
  diamond: 'diamond',
  dialpad: 'dialpad',
  doc: 'description',
  eco: 'eco',
  edit: 'edit',
  extension: 'extension',
  fire: 'local-fire-department',
  fence: 'fence',
  flask: 'science',
  car: 'directions-car',
  grass: 'grass',
  'group-add': 'group-add',
  groups: 'groups',
  hand: 'front-hand',
  help: 'help-outline',
  lock: 'lock',
  logout: 'logout',
  map: 'map',
  'local-florist': 'local-florist',
  mouse: 'pest-control-rodent',
  paw: 'pets',
  park: 'park',
  play: 'play-arrow',
  profile: 'person',
  rank: 'leaderboard',
  report: 'insights',
  restaurant: 'restaurant',
  rock: 'sports-mma',
  'rotate-left': 'rotate-left',
  rotate: 'rotate-right',
  flip: 'flip',
  scissors: 'content-cut',
  settings: 'settings',
  share: 'ios-share',
  spa: 'spa',
  triangle: 'change-history',
  square: 'square',
  circle: 'circle',
  pentagon: 'pentagon',
  timeline: 'timeline',
  'trend-up': 'trending-up',
  trophy: 'emoji-events',
  volume: 'volume-up',
  walk: 'directions-walk',
  'water-drop': 'water-drop',
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
