import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import type { GameResultInput } from '../../domain/games/results';
import { useAuth } from '../../providers/AuthProvider';
import { pushUnsyncedGameResultRounds } from '../sync/gameResultRoundsSync';
import { pushUnsyncedGameResults } from '../sync/gameResultsSync';
import { pushUnsyncedInterviewAnswers } from '../sync/interviewAnswersSync';
import { pushUnsyncedInterviewSessions } from '../sync/interviewSessionsSync';
import { pushUnsyncedMockExamResultItems } from '../sync/mockExamResultItemsSync';
import { pushUnsyncedMockExamResults } from '../sync/mockExamResultsSync';
import { gameResultKeys } from './useGameResults';
import { interviewAnswerKeys } from './useInterviewAnswers';
import { interviewSessionKeys } from './useInterviewSessions';
import { mockExamKeys } from './useMockExamResults';
import {
  abandonMockExamSession,
  completeMockExamGameItem,
  completeMockExamInterviewItem,
  finalizeMockExamSessionIfComplete,
  getActiveMockExamSession,
  startMockExamSession,
} from './mockExamSessions';
import type { InterviewAnswerInput } from './interviewAnswers';
import type { InterviewSessionInput } from './interviewSessions';

export const mockExamSessionKeys = {
  all: ['mock-exam-session'] as const,
  active: (userId: string | null) => ['mock-exam-session', userId, 'active'] as const,
};

export function useActiveMockExamSession() {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: mockExamSessionKeys.active(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('Cannot load a mock exam session without an authenticated user.');
      }
      return getActiveMockExamSession(db, userId);
    },
    enabled: userId != null,
  });
}

export function useStartMockExamSession() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error('Cannot start a mock exam session without an authenticated user.');
      }
      return startMockExamSession(db, userId);
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mockExamSessionKeys.all });
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useStartMockExamSession] start failed:', error);
      }
    },
  });
}

export function useAbandonMockExamSession() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => abandonMockExamSession(db, sessionId),
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mockExamSessionKeys.all });
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useAbandonMockExamSession] abandon failed:', error);
      }
    },
  });
}

export function useCompleteMockExamGameItem() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: ({
      durationMs,
      input,
      sessionId,
    }: {
      durationMs: number;
      input: GameResultInput;
      sessionId: string;
    }) => {
      if (!userId) {
        throw new Error('Cannot complete a mock exam game without an authenticated user.');
      }
      return completeMockExamGameItem(db, userId, sessionId, input, durationMs);
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mockExamSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: gameResultKeys.all });
      if (userId) {
        void (async () => {
          await pushUnsyncedGameResults(db, userId);
          await pushUnsyncedGameResultRounds(db, userId);
        })();
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useCompleteMockExamGameItem] complete failed:', error);
      }
    },
  });
}

export function useCompleteMockExamInterviewItem() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: ({
      input,
      sessionId,
      answers = [],
      resumeId,
      jobPostingId,
      interviewSessionId,
    }: {
      input: InterviewSessionInput;
      sessionId: string;
      answers?: readonly InterviewAnswerInput[];
      resumeId?: string;
      jobPostingId?: string;
      interviewSessionId?: string;
    }) => {
      if (!userId) {
        throw new Error('Cannot complete a mock exam interview without an authenticated user.');
      }
      return completeMockExamInterviewItem(db, userId, sessionId, input, answers, {
        resumeId,
        jobPostingId,
        interviewSessionId,
      });
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mockExamSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: interviewSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: interviewAnswerKeys.all });
      if (userId) {
        void (async () => {
          await pushUnsyncedInterviewSessions(db, userId);
          await pushUnsyncedInterviewAnswers(db, userId);
        })();
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useCompleteMockExamInterviewItem] complete failed:', error);
      }
    },
  });
}

export function useFinalizeMockExamSession() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (sessionId: string) => {
      if (!userId) {
        throw new Error('Cannot finalize a mock exam session without an authenticated user.');
      }
      return finalizeMockExamSessionIfComplete(db, userId, sessionId);
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mockExamSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: mockExamKeys.all });
      if (userId) {
        void (async () => {
          await pushUnsyncedMockExamResults(db, userId);
          await pushUnsyncedGameResults(db, userId);
          await pushUnsyncedInterviewSessions(db, userId);
          await pushUnsyncedInterviewAnswers(db, userId);
          await pushUnsyncedGameResultRounds(db, userId);
          await pushUnsyncedMockExamResultItems(db, userId);
        })();
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useFinalizeMockExamSession] finalize failed:', error);
      }
    },
  });
}
