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
  showBottomDivider?: boolean;
  showRightDivider?: boolean;
  variant?: 'card' | 'sectionItem';
};

export function GameTile({
  game,
  accessibilityState,
  disabled,
  onPress,
  showBottomDivider = false,
  showRightDivider = false,
  variant = 'card',
  ...props
}: GameTileProps) {
  const colors = toneColors[game.tone];
  const isDisabled = Boolean(disabled);
  const content = (
    <>
      <HStack align="flexStart" justify="spaceBetween">
        <Box
          alignItems="center"
          bg={colors.bg}
          borderRadius="r3"
          height="x10"
          justifyContent="center"
          width="x10"
        >
          <Icon name={game.icon} color={colors.fg} />
        </Box>
        {game.status === 'done' ? <Icon name="Check" color="fg.positive" size="small" /> : null}
      </HStack>
      <VStack gap="x0_5">
        <Text color="fg.neutral" textStyle="t4Bold" maxLines={1}>
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
    </>
  );

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
    >
      {variant === 'sectionItem' ? (
        <Box
          {...(showBottomDivider ? { borderBottomWidth: 'thin' as const } : {})}
          borderColor="stroke.neutralSubtle"
          {...(showRightDivider ? { borderRightWidth: 'thin' as const } : {})}
          gap="x3"
          p="x3"
        >
          {content}
        </Box>
      ) : (
        <Card gap="x3" p="x3">
          {content}
        </Card>
      )}
    </Pressable>
  );
}
