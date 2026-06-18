import { Fragment } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { games } from '../../data/games';
import { useGameResultsForMockExam } from '../../data/local/useGameResults';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { MockExamRecord } from '../../domain/types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';
import { Skeleton } from '../ui/Skeleton';
import { ReportScoreRow } from './ReportScoreRow';

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

function pressedRowStyle({ pressed }: { pressed: boolean }) {
  return { opacity: pressed ? 0.72 : 1 };
}

export function GamesSection({ record, previousRecord }: GamesSectionProps) {
  const router = useRouter();
  const currentResults = useGameResultsForMockExam(record.id);
  const previousResults = useGameResultsForMockExam(previousRecord?.id ?? null);
  const isLoading = currentResults.isLoading || (previousRecord != null && previousResults.isLoading);

  if (isLoading) {
    return (
      <Card p="spacingX.globalGutter">
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
    <Card p="spacingX.globalGutter">
      <List.Root>
        {games.map((game) => {
          const result = currentResults.data?.[game.id];
          const previous = previousResults.data?.[game.id];
          const delta = result && previous ? result.score - previous.score : null;

          return (
            <Fragment key={game.id}>
              {game.id !== games[0].id ? <List.Divider /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/games/[id]', params: { id: game.id } } as never)}
                style={pressedRowStyle}
              >
                <HStack align="center" gap="x3">
                  <Box flex={1}>
                    <ReportScoreRow
                      title={game.name}
                      description={game.skill}
                      value={result?.score ?? 0}
                      valueLabel={result?.score != null ? `${result.score}` : '-'}
                      supportingLabel={delta === null || delta === 0 ? null : deltaLabel(delta)}
                      supportingColor={delta != null && delta < 0 ? 'fg.critical' : 'fg.positive'}
                      reserveSupportingLabel
                    >
                      <Grid columns={2} gap="x2">
                        <Text color="fg.neutralMuted" textStyle="t2Regular">
                          정확도 {result ? formatAccuracy(result.accuracy) : '-'}
                        </Text>
                        <Text color="fg.neutralMuted" textStyle="t2Regular">
                          평균 {result ? formatResponseMs(result.avgResponseMs) : '-'}
                        </Text>
                      </Grid>
                    </ReportScoreRow>
                  </Box>
                  <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
                </HStack>
              </Pressable>
            </Fragment>
          );
        })}
      </List.Root>
    </Card>
  );
}
