import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { games } from '../games';
import type { GameResultInput } from '../../domain/games/results';
import type { GameId, GameWithProgress } from '../../domain/types';
import { useAuth } from '../../providers/AuthProvider';
import { pushUnsyncedGameResults } from '../sync/gameResultsSync';
import { getBestScoreForGame, getBestScores, insertGameResult } from './gameResults';

const gameResultKeys = {
  all: ['game-results'] as const,
  best: (userId: string | null) => ['game-results', userId, 'best'] as const,
  bestFor: (userId: string | null, gameId: GameId) =>
    ['game-results', userId, 'best', gameId] as const,
};

export function useBestScores() {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: gameResultKeys.best(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load game results without an authenticated user.');
      }
      return getBestScores(db, userId);
    },
    enabled: userId != null,
  });
}

export function useBestScore(gameId: GameId) {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: gameResultKeys.bestFor(userId, gameId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load game results without an authenticated user.');
      }
      return getBestScoreForGame(db, userId, gameId);
    },
    enabled: userId != null,
  });
}

export function useGamesWithProgress(): GameWithProgress[] {
  const { data: bestScores } = useBestScores();

  return useMemo(
    () =>
      games.map((game) => {
        const score = bestScores?.[game.id] ?? null;
        return {
          ...game,
          score,
          status: score != null ? 'done' : 'ready',
        };
      }),
    [bestScores],
  );
}

export function useSaveGameResult() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (input: GameResultInput) => {
      if (!userId) {
        throw new Error('Cannot save a game result without an authenticated user.');
      }
      return insertGameResult(db, userId, input);
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameResultKeys.all });
      if (userId) {
        void pushUnsyncedGameResults(db, userId);
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useSaveGameResult] save failed:', error);
      }
    },
  });
}
