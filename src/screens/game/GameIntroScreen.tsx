import { Body } from '../../components/app/Body';
import { BottomActionBar } from '../../components/app/BottomActionBar';
import { Header } from '../../components/app/Header';
import { Screen } from '../../components/app/Screen';
import { GameInstructionList } from '../../components/games/GameInstructionList';
import { GameStatBox } from '../../components/games/GameStatBox';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Tag } from '../../components/ui/Tag';
import { gameContent } from '../../data/gameContent';
import { useBestScore } from '../../data/local/useGameResults';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import type { Game } from '../../domain/types';

export type GameIntroScreenProps = {
  game: Game;
  onStart: () => void;
  onClose: () => void;
};

export function GameIntroScreen({ game, onStart, onClose }: GameIntroScreenProps) {
  const { data: bestScore } = useBestScore(game.id);
  const content = gameContent[game.id];
  const colors = toneColors[game.tone];

  return (
    <Screen>
      <Header title="게임" showBack onBack={onClose} />
      <Body bottomPad="x4">
        <VStack align="center" gap="x3">
          <Box
            alignItems="center"
            bg={colors.bg}
            borderRadius="r5"
            height="x16"
            justifyContent="center"
            width="x16"
          >
            <Icon name={game.icon} color={colors.fg} size="large" />
          </Box>
          <Text textStyle="t8Bold">{game.name}</Text>
          <Tag label={game.skill} selected />
        </VStack>

        <HStack gap="x2">
          <GameStatBox label="최고 점수" value={bestScore != null ? String(bestScore) : '—'} />
          <GameStatBox label="예상 시간" value={`${game.minutes}분`} />
          <GameStatBox label="문항" value={String(content?.totalRounds ?? 0)} />
        </HStack>

        <GameInstructionList items={content?.steps ?? []} />

        {content?.tip ? (
          <Card bg="bg.neutralWeak" borderWidth={0}>
            <Text color="fg.neutralMuted" textStyle="t3Regular">
              {content.tip}
            </Text>
          </Card>
        ) : null}
      </Body>
      <BottomActionBar primary={{ label: '연습 시작', iconRight: 'Play', onPress: onStart }} />
    </Screen>
  );
}
