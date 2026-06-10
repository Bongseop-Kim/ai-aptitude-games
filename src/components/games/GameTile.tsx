import { Pressable, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import type { GameWithProgress } from '../../domain/types';
import { ProgressBar } from '../readiness/ProgressBar';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export type GameTileProps = Omit<PressableProps, 'children'> & {
  game: GameWithProgress;
};

export function GameTile({ game, accessibilityState, disabled, onPress, ...props }: GameTileProps) {
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
      <Card gap="x3" p="x3">
        <HStack align="flexStart" justify="spaceBetween">
          <Box
            alignItems="center"
            bg={locked ? 'bg.disabled' : colors.bg}
            borderRadius="r3"
            height="x10"
            justifyContent="center"
            width="x10"
          >
            <Icon name={locked ? 'lock' : game.icon} color={locked ? 'fg.disabled' : colors.fg} />
          </Box>
          {game.status === 'done' ? <Icon name="check" color="fg.positive" size="small" /> : null}
        </HStack>
        <VStack gap="x0_5">
          <Text color={locked ? 'fg.disabled' : 'fg.neutral'} textStyle="t4Bold" maxLines={1}>
            {game.name}
          </Text>
          <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
            {game.skill}
          </Text>
        </VStack>
        <HStack align="center" gap="x2">
          {game.score != null ? (
            <ProgressBar value={game.score} tone={game.tone} layout="inline" />
          ) : null}
          <Text textStyle="t3Bold">{game.score ?? '—'}</Text>
        </HStack>
      </Card>
    </Pressable>
  );
}
