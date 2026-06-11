import { useState } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { TabScreen } from '../components/app/TabScreen';
import { GameListRow } from '../components/games/GameListRow';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Tag } from '../components/ui/Tag';
import { useGamesWithProgress } from '../data/local/useGameResults';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { GameWithProgress } from '../domain/types';

type GameFilter = 'all' | 'done' | 'todo';

const gameFilters: { value: GameFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'done', label: '완료' },
  { value: 'todo', label: '미완료' },
];

function matchesFilter(game: GameWithProgress, filter: GameFilter) {
  if (filter === 'all') return true;
  if (filter === 'done') return game.status === 'done';
  return game.status !== 'done';
}

export function GamesScreen() {
  const [filter, setFilter] = useState<GameFilter>('all');
  const router = useRouter();
  const gamesWithProgress = useGamesWithProgress();

  return (
    <TabScreen header={<Header title="게임" subtitle="9개 역량 게임 · 매일 새 문항" />}>
      <MockExamBanner />
      <HStack align="center" gap="x2">
        {gameFilters.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === value }}
            onPress={() => setFilter(value)}
          >
            <Tag label={label} selected={filter === value} />
          </Pressable>
        ))}
      </HStack>
      <VStack gap="x2">
        {gamesWithProgress
          .filter((game) => matchesFilter(game, filter))
          .map((game) => (
            <GameListRow
              key={game.id}
              game={game}
              onPress={() => router.push({ pathname: '/games/[id]', params: { id: game.id } })}
            />
          ))}
      </VStack>
    </TabScreen>
  );
}

function MockExamBanner() {
  return (
    <Pressable accessibilityLabel="모의고사 시작" accessibilityRole="button">
      <Card bg="bg.neutralSolid" borderColor="stroke.neutralContrast" borderRadius="r5" p="x4">
        <HStack align="center" gap="x3">
          <Icon name="Trophy" color="fg.brand" size="large" />
          <VStack flex={1} gap="x0_5">
            <Text color="fg.neutralInverted" textStyle="t4Bold" maxLines={1}>
              모의고사 한 번에 9게임
            </Text>
            <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
              완주하면 종합 리포트가 열려요 · 22분
            </Text>
          </VStack>
          <Icon name="ChevronRight" color="fg.neutralInverted" />
        </HStack>
      </Card>
    </Pressable>
  );
}
