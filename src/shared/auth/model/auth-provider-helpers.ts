import type { AuthSession } from "../auth-service";
import type { AuthTokens } from "./auth-types";
import { shouldRefreshToken } from "./auth-session";

type PersistSignedInSessionArgs = {
  displayName: string;
  saveSession: (displayName: string) => Promise<AuthSession>;
  loadTokens: () => Promise<AuthTokens | null>;
  rollbackAuthState: () => Promise<void>;
};

export const persistSignedInSession = async ({
  displayName,
  saveSession,
  loadTokens,
  rollbackAuthState,
}: PersistSignedInSessionArgs) => {
  const session = await saveSession(displayName);

  try {
    const tokens = await loadTokens();
    return {
      session,
      hasValidAccessToken: tokens == null || !shouldRefreshToken(tokens),
    };
  } catch (error) {
    await rollbackAuthState();
    throw error;
  }
};

export const shouldApplyRefreshResult = ({
  startedGeneration,
  currentGeneration,
}: {
  startedGeneration: number;
  currentGeneration: number;
}) => startedGeneration === currentGeneration;
