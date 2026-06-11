import { Body } from '../../components/app/Body';
import { Header } from '../../components/app/Header';
import { Screen } from '../../components/app/Screen';
import { GameStatBox } from '../../components/games/GameStatBox';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { gameContent } from '../../data/gameContent';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { gradeForScore, peerPercentile, type GameResultInput } from '../../domain/games/results';
import { toneColors } from '../../domain/tone';
import type { Game } from '../../domain/types';

export type GameResultScreenProps = {
  game: Game;
  result: GameResultInput;
  onRetry: () => void;
  onExit: () => void;
};

export function GameResultScreen({ game, result, onRetry, onExit }: GameResultScreenProps) {
  const content = gameContent[game.id];
  const colors = toneColors[game.tone];

  return (
    <Screen>
      <Header title="결과" showBack onBack={onExit} />
      <Body bottomPad="x4">
        <VStack align="center" gap="x2">
          <Box
            alignItems="center"
            bg={colors.bg}
            borderRadius="r4"
            height="x14"
            justifyContent="center"
            width="x14"
          >
            <Icon name={game.icon} color={colors.fg} size="large" />
          </Box>
          <Text color="fg.neutralSubtle" textStyle="t3Regular">
            {game.name}
          </Text>
        </VStack>

        <Card bg="palette.green100" borderWidth={0}>
          <VStack align="center" gap="x2">
            <Text color="fg.neutralMuted" textStyle="t3Regular">
              최종 점수
            </Text>
            <HStack align="flexEnd" gap="x1">
              <Text textStyle="screenTitle">{result.score}</Text>
              <Text color="fg.neutralSubtle" textStyle="t4Regular">
                / 100
              </Text>
            </HStack>
            <Badge label={gradeForScore(result.score)} tone="positive" />
          </VStack>
        </Card>

        <HStack gap="x2">
          <GameStatBox label="정답률" value={`${Math.round(result.accuracy * 100)}%`} />
          <GameStatBox label="평균 응답" value={`${(result.avgResponseMs / 1000).toFixed(1)}초`} />
          <GameStatBox label="또래 대비" value={`상위 ${peerPercentile(result.score)}%`} />
        </HStack>

        {content ? (
          <Card bg="palette.yellow100" borderWidth={0} gap="x1">
            <Text textStyle="t4Bold">{game.skill}</Text>
            <Text color="fg.neutralMuted" textStyle="t3Regular">
              {content.skillDescription}
            </Text>
          </Card>
        ) : null}
      </Body>
      <HStack gap="x2" pt="x2">
        <Box flex={1}>
          <Button label="다시" variant="outline" tone="neutral" fullWidth onPress={onRetry} />
        </Box>
        <Box flex={1.4}>
          <Button label="게임 목록" iconRight="ArrowRight" fullWidth onPress={onExit} />
        </Box>
      </HStack>
    </Screen>
  );
}
