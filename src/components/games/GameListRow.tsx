import type { PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import type { GameWithProgress } from '../../domain/types';
import { ProgressBar } from '../readiness/ProgressBar';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';

export type GameListRowProps = Omit<PressableProps, 'children'> & {
  game: GameWithProgress;
};

export function GameListRow({ game, accessibilityState, disabled, onPress, ...props }: GameListRowProps) {
  const colors = toneColors[game.tone];
  const isDisabled = Boolean(disabled);

  return (
    <List.Item
      {...props}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
    >
      <List.Prefix>
        <Box
          alignItems="center"
          bg={colors.bg}
          borderRadius="r3"
          height="x11"
          justifyContent="center"
          width="x11"
        >
          <Icon name={game.icon} color={colors.fg} />
        </Box>
      </List.Prefix>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <List.Title>{game.name}</List.Title>
          {game.status === 'done' ? <Icon name="Check" color="fg.positive" size="small" /> : null}
        </HStack>
        <List.Detail>{`${game.skill} · ${game.minutes}분`}</List.Detail>
        <HStack align="center" gap="x2" pt="x1">
          {game.score != null ? <ProgressBar value={game.score} tone={game.tone} layout="inline" /> : null}
          <Text textStyle="t3Bold">{game.score ?? '—'}</Text>
        </HStack>
      </List.Content>
      <List.Suffix>
        <Icon name="ChevronRight" size="small" />
      </List.Suffix>
    </List.Item>
  );
}
