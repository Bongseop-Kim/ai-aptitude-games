import { shouldApplyRefreshResult } from "@/shared/auth/model/auth-provider-helpers";
import type { AuthSession } from "@/shared/auth/auth-service";

export const buildBootstrapFailureState = (
  storedSession: AuthSession | null
) => ({
  storedSession,
  hasValidToken: false,
  didRefreshFail: true,
});

export const buildRefreshFailureState = ({
  session,
  startedGeneration,
  currentGeneration,
}: {
  session: AuthSession | null;
  startedGeneration: number;
  currentGeneration: number;
}) => {
  if (!shouldApplyRefreshResult({ startedGeneration, currentGeneration })) {
    return null;
  }

  return {
    session,
    hasValidAccessToken: false,
    refreshFailed: true,
  };
};

export const cleanupDiscardedRefreshResult = async ({
  startedGeneration,
  currentGeneration,
  clearPersistedAuthState,
  logError,
  context,
}: {
  startedGeneration: number;
  currentGeneration: number;
  clearPersistedAuthState: () => Promise<void>;
  logError: (message: string, error: unknown) => void;
  context: string;
}) => {
  if (shouldApplyRefreshResult({ startedGeneration, currentGeneration })) {
    return false;
  }

  await clearPersistedAuthStateBestEffort({
    clearPersistedAuthState,
    logError,
    context,
  });
  return true;
};

export const clearPersistedAuthStateBestEffort = async ({
  clearPersistedAuthState,
  logError,
  context,
}: {
  clearPersistedAuthState: () => Promise<void>;
  logError: (message: string, error: unknown) => void;
  context: string;
}) => {
  try {
    await clearPersistedAuthState();
  } catch (error) {
    logError(`${context}: failed to clear persisted auth state`, error);
  }
};
