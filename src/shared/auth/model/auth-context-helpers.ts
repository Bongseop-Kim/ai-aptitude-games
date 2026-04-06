import { shouldApplyRefreshResult } from "@/shared/auth/model/auth-provider-helpers";
import type { AuthSession } from "@/shared/auth/auth-service";

export const buildBootstrapFailureState = () => ({
  storedSession: null as AuthSession | null,
  hasValidToken: false,
  didRefreshFail: true,
});

export const buildRefreshFailureState = ({
  startedGeneration,
  currentGeneration,
}: {
  startedGeneration: number;
  currentGeneration: number;
}) => {
  if (!shouldApplyRefreshResult({ startedGeneration, currentGeneration })) {
    return null;
  }

  return {
    session: null as AuthSession | null,
    hasValidAccessToken: false,
    refreshFailed: true,
  };
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
