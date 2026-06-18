import { Fragment } from 'react';

import { games } from '../../data/games';
import { useGameResultsForMockExam } from '../../data/local/useGameResults';
import { HStack, VStack } from '../../design-system/components/Stack';
import type { ReportGameInsight } from '../../domain/report';
import type { MockExamRecord } from '../../domain/types';
import { Card } from '../ui/Card';
import { List } from '../ui/List';
import { Skeleton } from '../ui/Skeleton';
import { ReportScoreListCard } from './ReportScoreListCard';
import { ReportScoreRow } from './ReportScoreRow';

type GamesSectionProps = {
  record: MockExamRecord;
  gameInsights?: ReportGameInsight[] | null;
};

function formatAccuracy(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatResponseMs(value: number) {
  return `${(value / 1000).toFixed(1)}초`;
}

const TITLE_COLUMN_WIDTH = 'x23';
const SCORE_COLUMN_WIDTH = 'x10';

export function GamesSection({ record, gameInsights = null }: GamesSectionProps) {
  const currentResults = useGameResultsForMockExam(record.id);
  const isLoading = currentResults.isLoading;
  const peerMedianByGameId = new Map(
    (gameInsights ?? []).map((gameInsight) => [gameInsight.game_id, gameInsight.peer_median ?? null]),
  );
  const hasPeerMedian = Array.from(peerMedianByGameId.values()).some((peerMedian) => peerMedian != null);

  if (isLoading) {
    return (
      <Card px="spacingX.globalGutter" py="x2">
        <VStack gap="x3">
          {games.map((game) => (
            <VStack key={game.id} gap="x2" minHeight="x24">
              <HStack align="center" gap="x3">
                <Skeleton height="x4" width={TITLE_COLUMN_WIDTH} />
                <Skeleton flex={1} height="x3" />
                <Skeleton height="x4" width={SCORE_COLUMN_WIDTH} />
              </HStack>
              <HStack align="center" gap="x2">
                <Skeleton height="x3" width={TITLE_COLUMN_WIDTH} />
                <Skeleton flex={1} height="x3" />
              </HStack>
            </VStack>
          ))}
        </VStack>
      </Card>
    );
  }

  return (
    <ReportScoreListCard markerLegendLabel={hasPeerMedian ? '또래 중앙값' : null}>
      {games.map((game) => {
        const result = currentResults.data?.[game.id];
        const peerMedian = peerMedianByGameId.get(game.id) ?? null;

        return (
          <Fragment key={game.id}>
            {game.id !== games[0].id ? <List.Divider /> : null}
            <ReportScoreRow
              title={game.name}
              value={result?.score ?? null}
              markerValue={peerMedian}
              tagItems={[
                { label: game.skill },
                { label: `정확도 ${result ? formatAccuracy(result.accuracy) : '-'}` },
                { label: `평균 ${result ? formatResponseMs(result.avgResponseMs) : '-'}` },
              ]}
            />
          </Fragment>
        );
      })}
    </ReportScoreListCard>
  );
}
