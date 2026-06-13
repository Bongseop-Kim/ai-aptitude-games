import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '../../providers/AuthProvider';
import { uploadPendingInterviewMedia } from '../media/interviewMediaUpload';
import { pushUnsyncedInterviewAnswers } from '../sync/interviewAnswersSync';
import { pushUnsyncedInterviewSessions } from '../sync/interviewSessionsSync';
import {
  getInterviewAnswersBySession,
  insertInterviewAnswers,
  type InterviewAnswerInput,
} from './interviewAnswers';
import { insertInterviewSession, type InterviewSessionInput } from './interviewSessions';
import { interviewSessionKeys } from './useInterviewSessions';

export const interviewAnswerKeys = {
  all: ['interview-answers'] as const,
  session: (sessionId: string | null) => ['interview-answers', sessionId, 'records'] as const,
};

export function useInterviewAnswers(sessionId: string | null) {
  const db = useSQLiteContext();
  const { userId } = useAuth();

  return useQuery({
    queryKey: interviewAnswerKeys.session(sessionId),
    queryFn: () => {
      if (!sessionId) {
        throw new Error('Cannot load interview answers without a session id.');
      }
      return getInterviewAnswersBySession(db, sessionId);
    },
    enabled: userId != null && sessionId != null,
  });
}

type SaveInterviewOutcomeInput = {
  session: InterviewSessionInput;
  answers: readonly InterviewAnswerInput[];
  resumeId?: string;
  jobPostingId?: string;
  interviewSessionId?: string;
};

export function useSaveInterviewOutcome() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async ({
      session,
      answers,
      resumeId,
      jobPostingId,
      interviewSessionId,
    }: SaveInterviewOutcomeInput) => {
      if (!userId) {
        throw new Error('Cannot save an interview outcome without an authenticated user.');
      }

      let sessionId = '';
      await db.withTransactionAsync(async () => {
        sessionId = await insertInterviewSession(db, userId, session, {
          id: interviewSessionId,
          resumeId,
          jobPostingId,
        });
        await insertInterviewAnswers(db, userId, sessionId, answers);
      });

      return sessionId;
    },
    retry: 2,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: interviewSessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: interviewAnswerKeys.all });
      if (userId) {
        void pushUnsyncedInterviewSessions(db, userId);
        void pushUnsyncedInterviewAnswers(db, userId);
        void uploadPendingInterviewMedia(db, userId);
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[useSaveInterviewOutcome] save failed:', error);
      }
    },
  });
}
