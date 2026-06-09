import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import type { Game } from '../../domain/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export type GameIntroCardProps = {
  game: Game;
};

export function GameIntroCard({ game }: GameIntroCardProps) {
  return (
    <Card gap="x4" elevated>
      <HStack align="center" gap="x3">
        <Box
          alignItems="center"
          bg={toneColors[game.tone].bg}
          borderRadius="r4"
          height="x12"
          justifyContent="center"
          width="x12"
        >
          <Icon name={game.icon} color={toneColors[game.tone].fg} size="large" />
        </Box>
        <VStack flex={1} gap="x1">
          <Text textStyle="t8Bold">{game.name}</Text>
          <Text color="fg.neutralMuted" textStyle="t4Regular">
            {game.skill} · {game.minutes}분
          </Text>
        </VStack>
      </HStack>
      <Text color="fg.neutralMuted" textStyle="t4Regular">
        {game.description}
      </Text>
      <Button label="연습 시작" fullWidth />
    </Card>
  );
}
