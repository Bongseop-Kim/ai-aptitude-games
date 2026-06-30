import { Fragment, useState } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { TabScreen } from '../components/app/TabScreen';
import { GameListRow } from '../components/games/GameListRow';
import { Card } from '../components/ui/Card';
import { List } from '../components/ui/List';
import { Tag } from '../components/ui/Tag';
import { useGamesWithProgress } from '../data/local/useGameResults';
import { HStack } from '../design-system/components/Stack';
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
  const filtered = gamesWithProgress.filter((game) => matchesFilter(game, filter));

  return (
    <TabScreen
      header={<Header title="게임" />}
      pinnedContent={
        <HStack align="center" gap="x2" pt="spacingY.componentDefault" pb="x2">
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
      }
    >
      <Card bg="bg.layerDefault" overflow="hidden" py="x1">
        <List.Root>
          {filtered.map((game, index) => (
            <Fragment key={game.id}>
              {index > 0 ? <List.Divider /> : null}
              <GameListRow
                game={game}
                onPress={() => router.push({ pathname: '/games/[id]', params: { id: game.id } } as never)}
              />
            </Fragment>
          ))}
        </List.Root>
      </Card>
    </TabScreen>
  );
}
