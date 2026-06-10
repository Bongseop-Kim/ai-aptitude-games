import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import type { GameWithProgress } from '../../domain/types';
import { ProgressBar } from '../readiness/ProgressBar';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export type GameListRowProps = Omit<PressableProps, 'children'> & {
  game: GameWithProgress;
};

export function GameListRow({ game, accessibilityState, disabled, onPress, ...props }: GameListRowProps) {
  const colors = toneColors[game.tone];
  const locked = game.status === 'locked';
  const isDisabled = locked || Boolean(disabled);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={locked ? undefined : onPress}
    >
      <Card p="x3">
        <HStack align="center" gap="x3">
          <Box
            alignItems="center"
            bg={locked ? 'bg.disabled' : colors.bg}
            borderRadius="r3"
            height="x11"
            justifyContent="center"
            width="x11"
          >
            <Icon name={locked ? 'lock' : game.icon} color={locked ? 'fg.disabled' : colors.fg} />
          </Box>
          <VStack flex={1} gap="x1_5">
            <VStack gap="x0_5">
              <HStack align="center" gap="x1_5">
                <Text color={locked ? 'fg.disabled' : 'fg.neutral'} textStyle="t4Bold" maxLines={1}>
                  {game.name}
                </Text>
                {game.status === 'done' ? <Icon name="check" color="fg.positive" size="small" /> : null}
              </HStack>
              <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
                {game.skill} · {game.minutes}분
              </Text>
            </VStack>
            <HStack align="center" gap="x2">
              {game.score != null ? (
                <ProgressBar value={game.score} tone={game.tone} layout="inline" />
              ) : null}
              <Text textStyle="t3Bold">{game.score ?? '—'}</Text>
            </HStack>
          </VStack>
          <Icon name="chevron-right" color="fg.neutralSubtle" size="small" />
        </HStack>
      </Card>
    </Pressable>
  );
}
