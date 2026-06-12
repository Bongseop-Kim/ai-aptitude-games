import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { games } from '../../data/games';
import { useGameResultsForMockExam } from '../../data/local/useGameResults';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { MockExamRecord } from '../../domain/types';
import { ProgressBar } from '../readiness/ProgressBar';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Skeleton } from '../ui/Skeleton';

type GamesSectionProps = {
  record: MockExamRecord;
  previousRecord: MockExamRecord | null;
};

function formatAccuracy(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatResponseMs(value: number) {
  return `${(value / 1000).toFixed(1)}초`;
}

function deltaLabel(delta: number) {
  return `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}`;
}

export function GamesSection({ record, previousRecord }: GamesSectionProps) {
  const router = useRouter();
  const currentResults = useGameResultsForMockExam(record.id);
  const previousResults = useGameResultsForMockExam(previousRecord?.id ?? null);
  const isLoading = currentResults.isLoading || (previousRecord != null && previousResults.isLoading);

  if (isLoading) {
    return (
      <Card>
        <VStack gap="x3">
          {games.map((game) => (
            <VStack key={game.id} gap="x1_5" minHeight="x16">
              <HStack align="center" gap="x3">
                <Skeleton height="x4" width="x16" />
                <Skeleton height="x2" width="full" />
                <Skeleton height="x4" width="x8" />
              </HStack>
              <Skeleton height="x3" width="x16" />
            </VStack>
          ))}
        </VStack>
      </Card>
    );
  }

  return (
    <Card>
      <VStack gap="x3">
        {games.map((game) => {
          const result = currentResults.data?.[game.id];
          const previous = previousResults.data?.[game.id];
          const delta = result && previous ? result.score - previous.score : null;

          return (
            <Pressable
              key={game.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/games/[id]', params: { id: game.id } } as never)}
            >
              <VStack gap="x1_5" minHeight="x16" py="x1">
                <HStack align="center" gap="x3">
                  <VStack width="x16">
                    <Text textStyle="t3Bold" maxLines={1}>
                      {game.name}
                    </Text>
                    <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={1}>
                      {game.skill}
                    </Text>
                  </VStack>
                  <ProgressBar value={result?.score ?? 0} tone={game.tone} layout="inline" />
                  <Text align="right" textStyle="t4Bold">
                    {result?.score ?? '-'}
                  </Text>
                  <HStack align="center" justify="flexEnd" width="x10">
                    {delta === null || delta === 0 ? (
                      <Box style={{ opacity: 0 }}>
                        <Text textStyle="t2Bold">▲ 0</Text>
                      </Box>
                    ) : (
                      <Text
                        color={delta > 0 ? 'fg.positive' : 'fg.critical'}
                        textStyle="t2Bold"
                      >
                        {deltaLabel(delta)}
                      </Text>
                    )}
                  </HStack>
                  <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
                </HStack>
                <Grid columns={2} gap="x2" pl="x16">
                  <Text color="fg.neutralMuted" textStyle="t2Regular">
                    정확도 {result ? formatAccuracy(result.accuracy) : '-'}
                  </Text>
                  <Text color="fg.neutralMuted" textStyle="t2Regular">
                    평균 {result ? formatResponseMs(result.avgResponseMs) : '-'}
                  </Text>
                </Grid>
              </VStack>
            </Pressable>
          );
        })}
      </VStack>
    </Card>
  );
}
