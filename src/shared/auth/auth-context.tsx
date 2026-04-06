import { getApiBaseUrlFromEnv } from "@/shared/config/api";
import { createAuthApi } from "@/shared/auth/api/auth-api";
import {
  loadAuthTokens,
  saveAuthTokens,
} from "@/shared/auth/lib/token-store";
import {
  getAuthStatus,
  shouldRefreshToken,
  type AuthStatus,
} from "@/shared/auth/model/auth-session";
import {
  persistSignedInSession,
  shouldApplyRefreshResult,
} from "@/shared/auth/model/auth-provider-helpers";
import {
  buildBootstrapFailureState,
  buildRefreshFailureState,
  cleanupDiscardedRefreshResult,
  clearPersistedAuthStateBestEffort,
} from "@/shared/auth/model/auth-context-helpers";
import { ThemedView } from "@/shared/ui/themed-view";
import {
  bootstrapAuthSession,
  clearPersistedAuthState,
  saveAuthSession,
  type AuthSession,
} from "@/shared/auth/auth-service";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

type AuthState = {
  isLoading: boolean;
  authStatus: AuthStatus;
  session: AuthSession | null;
  isAuthenticated: boolean;
  hasValidAccessToken: boolean;
  isSigningIn: boolean;
  signIn: (displayName: string) => Promise<AuthSession>;
  refreshIfNeeded: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const AuthLoadingFallback = () => (
  <ThemedView style={styles.loadingFallback}>
    <ActivityIndicator size="large" />
  </ThemedView>
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hasValidAccessToken, setHasValidAccessToken] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);
  const sessionGenerationRef = useRef(0);

  const refreshIfNeeded = useCallback(async () => {
    if (refreshInFlightRef.current != null) {
      return refreshInFlightRef.current;
    }

    const startedGeneration = sessionGenerationRef.current;
    let refreshPromise: Promise<boolean> | null = null;
    refreshPromise = (async () => {
      try {
        const tokens = await loadAuthTokens();

        if (tokens === null) {
          // No tokens (e.g., legacy-migrated session): leave existing auth state intact.
          return true;
        }

        if (!shouldRefreshToken(tokens)) {
          setHasValidAccessToken(Boolean(tokens.accessToken));
          setRefreshFailed(false);
          return true;
        }

        const authApi = createAuthApi({
          baseUrl: getApiBaseUrlFromEnv(),
          authorizedRequest: (url, init) => fetch(url, init),
        });
        const refreshed = await authApi.refresh(tokens.refreshToken);
        if (
          !shouldApplyRefreshResult({
            startedGeneration,
            currentGeneration: sessionGenerationRef.current,
          })
        ) {
          return false;
        }
        await saveAuthTokens(refreshed);
        if (
          await cleanupDiscardedRefreshResult({
            startedGeneration,
            currentGeneration: sessionGenerationRef.current,
            clearPersistedAuthState,
            logError: console.error,
            context: "refreshIfNeeded",
          })
        ) {
          return false;
        }
        setHasValidAccessToken(true);
        setRefreshFailed(false);
        return true;
      } catch (error) {
        console.error("refreshIfNeeded: failed to refresh auth tokens", error);
        const failureState = buildRefreshFailureState({
          session,
          startedGeneration,
          currentGeneration: sessionGenerationRef.current,
        });
        if (failureState == null) {
          return false;
        }
        void clearPersistedAuthStateBestEffort({
          clearPersistedAuthState,
          logError: console.error,
          context: "refreshIfNeeded",
        });
        setSession(failureState.session);
        setHasValidAccessToken(failureState.hasValidAccessToken);
        setRefreshFailed(failureState.refreshFailed);
        return false;
      } finally {
        if (refreshInFlightRef.current === refreshPromise) {
          refreshInFlightRef.current = null;
        }
      }
    })();
    refreshInFlightRef.current = refreshPromise;

    return refreshPromise;
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const bootstrapGeneration = sessionGenerationRef.current;
      let storedSession: AuthSession | null = null;
      let hasValidToken = false;
      let didRefreshFail = false;
      try {
        storedSession = await bootstrapAuthSession();
        const storedTokens = await loadAuthTokens();

        if (storedSession == null) {
          hasValidToken = false;
        } else if (storedTokens == null) {
          // Legacy mode during migration: allow session-only auth state.
          hasValidToken = true;
        } else if (!shouldRefreshToken(storedTokens)) {
          hasValidToken = true;
        } else {
          const startedGeneration = sessionGenerationRef.current;
          const authApi = createAuthApi({
            baseUrl: getApiBaseUrlFromEnv(),
            authorizedRequest: (url, init) => fetch(url, init),
          });
          try {
            const refreshed = await authApi.refresh(storedTokens.refreshToken);
            if (
              !shouldApplyRefreshResult({
                startedGeneration,
                currentGeneration: sessionGenerationRef.current,
              })
            ) {
              return;
            }
            await saveAuthTokens(refreshed);
            if (
              await cleanupDiscardedRefreshResult({
                startedGeneration,
                currentGeneration: sessionGenerationRef.current,
                clearPersistedAuthState,
                logError: console.error,
                context: "bootstrap",
              })
            ) {
              return;
            }
            hasValidToken = true;
          } catch {
            if (
              !shouldApplyRefreshResult({
                startedGeneration,
                currentGeneration: sessionGenerationRef.current,
              })
            ) {
              return;
            }
            ({ storedSession, hasValidToken, didRefreshFail } =
              buildBootstrapFailureState(storedSession));
            await clearPersistedAuthStateBestEffort({
              clearPersistedAuthState,
              logError: console.error,
              context: "bootstrap",
            });
          }
        }
      } catch (error) {
        console.error("bootstrap: unexpected auth init error", error);
        ({ storedSession, hasValidToken, didRefreshFail } =
          buildBootstrapFailureState(storedSession));
        await clearPersistedAuthStateBestEffort({
          clearPersistedAuthState,
          logError: console.error,
          context: "bootstrap",
        });
      } finally {
        if (
          mounted &&
          shouldApplyRefreshResult({
            startedGeneration: bootstrapGeneration,
            currentGeneration: sessionGenerationRef.current,
          })
        ) {
          setSession(storedSession);
          setHasValidAccessToken(hasValidToken);
          setRefreshFailed(didRefreshFail);
          setIsLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (displayName: string) => {
      setIsSigningIn(true);
      try {
        const nextState = await persistSignedInSession({
          displayName,
          saveSession: saveAuthSession,
          loadTokens: loadAuthTokens,
          rollbackAuthState: async () => {
            await clearPersistedAuthState();
          },
        });
        setSession(nextState.session);
        setHasValidAccessToken(nextState.hasValidAccessToken);
        setRefreshFailed(false);
        return nextState.session;
      } finally {
        setIsSigningIn(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    sessionGenerationRef.current += 1;
    try {
      await clearPersistedAuthState();
    } finally {
      setSession(null);
      setHasValidAccessToken(false);
      setRefreshFailed(false);
    }
  }, []);

  const authStatus = getAuthStatus({
    isLoading,
    hasSession: session != null,
    requiresRefresh: session != null && !hasValidAccessToken,
    refreshFailed,
  });

  const value: AuthState = useMemo(
    () => ({
      isLoading,
      authStatus,
      session,
      isAuthenticated: session != null && hasValidAccessToken,
      hasValidAccessToken,
      isSigningIn,
      signIn,
      refreshIfNeeded,
      signOut,
    }),
    [
      isLoading,
      authStatus,
      session,
      hasValidAccessToken,
      isSigningIn,
      signIn,
      refreshIfNeeded,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <AuthLoadingFallback /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  loadingFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
