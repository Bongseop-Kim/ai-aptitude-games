import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import { Icon, type IconName } from '../ui/Icon';

export type ResponseButtonState = 'idle' | 'correct' | 'wrong';

export type ResponseButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  icon?: IconName;
  state?: ResponseButtonState;
};

const stateColors = {
  idle: {
    bg: 'bg.layerDefault',
    border: 'stroke.neutralWeak',
    fg: 'fg.neutral',
  },
  correct: {
    bg: toneColors.positive.bg,
    border: toneColors.positive.fg,
    fg: toneColors.positive.fg,
  },
  wrong: {
    bg: toneColors.critical.bg,
    border: toneColors.critical.fg,
    fg: toneColors.critical.fg,
  },
} as const;

export function answerButtonState<T>(
  picked: T | null,
  answer: T,
  value: T,
): ResponseButtonState {
  if (picked == null) return 'idle';
  if (value === answer) return 'correct';
  if (value === picked) return 'wrong';
  return 'idle';
}

export function ResponseButton({ label, icon, state = 'idle', ...props }: ResponseButtonProps) {
  const colors = stateColors[state];

  return (
    <Pressable accessibilityRole="button" {...props}>
      <Box
        alignItems="center"
        bg={colors.bg}
        borderColor={colors.border}
        borderRadius="r3"
        borderWidth="thin"
        gap="x1"
        px="x2"
        py="x3"
      >
        {icon ? <Icon name={icon} color={colors.fg} /> : null}
        <Text align="center" color={colors.fg} textStyle="t4Bold">
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
