import type { ColorToken } from '../design-system/components/style-props';
import type { Tone } from './types';

export type ToneColors = {
  bg: ColorToken;
  border: ColorToken;
  fg: ColorToken;
};

export const toneColors: Record<Tone, ToneColors> = {
  brand: { bg: 'bg.brandWeak', border: 'stroke.brandWeak', fg: 'fg.brand' },
  critical: { bg: 'palette.red100', border: 'stroke.neutralSubtle', fg: 'fg.critical' },
  informative: { bg: 'palette.blue100', border: 'stroke.neutralSubtle', fg: 'fg.informative' },
  neutral: { bg: 'bg.neutralWeak', border: 'stroke.neutralWeak', fg: 'fg.neutralMuted' },
  positive: { bg: 'palette.green100', border: 'stroke.neutralSubtle', fg: 'fg.positive' },
  warning: { bg: 'palette.yellow100', border: 'stroke.neutralSubtle', fg: 'fg.warning' },
};
