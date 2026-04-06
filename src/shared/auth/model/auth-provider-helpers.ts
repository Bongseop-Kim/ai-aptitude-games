import type { AuthSession } from "@/shared/auth/auth-service";
import type { AuthTokens } from "@/shared/auth/model/auth-types";
import { shouldRefreshToken } from "@/shared/auth/model/auth-session";

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
    const hasValidAccessToken =
      tokens != null && !shouldRefreshToken(tokens);

    if (!hasValidAccessToken) {
      await rollbackAuthState();
      throw new Error("missing valid auth tokens after sign-in");
    }

    return {
      session,
      hasValidAccessToken,
    };
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "missing valid auth tokens after sign-in") {
      await rollbackAuthState();
    }
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
