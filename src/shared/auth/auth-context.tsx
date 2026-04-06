import { getApiBaseUrlFromEnv } from "@/shared/config/api";
import { createAuthApi } from "@/shared/auth/api/auth-api";
import {
  clearAuthTokens,
  loadAuthTokens,
  saveAuthTokens,
} from "@/shared/auth/lib/token-store";
import {
  getAuthStatus,
  shouldRefreshToken,
  type AuthStatus,
} from "@/shared/auth/model/auth-session";
import {
  bootstrapAuthSession,
  clearAuthSession,
  saveAuthSession,
  type AuthSession,
} from "@/shared/auth/auth-service";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
let refreshInFlight: Promise<boolean> | null = null;

const AuthLoadingFallback = () => (
  <ActivityIndicator size="large" style={styles.loadingFallback} />
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hasValidAccessToken, setHasValidAccessToken] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const refreshIfNeeded = useCallback(async () => {
    if (refreshInFlight != null) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
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
        await saveAuthTokens(refreshed);
        setHasValidAccessToken(true);
        setRefreshFailed(false);
        return true;
      } catch (error) {
        console.error("refreshIfNeeded: failed to refresh auth tokens", error);
        await Promise.allSettled([clearAuthTokens(), clearAuthSession()]);
        setSession(null);
        setHasValidAccessToken(false);
        setRefreshFailed(true);
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
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
          const authApi = createAuthApi({
            baseUrl: getApiBaseUrlFromEnv(),
            authorizedRequest: (url, init) => fetch(url, init),
          });
          try {
            const refreshed = await authApi.refresh(storedTokens.refreshToken);
            await saveAuthTokens(refreshed);
            hasValidToken = true;
          } catch {
            await Promise.allSettled([clearAuthTokens(), clearAuthSession()]);
            storedSession = null;
            hasValidToken = false;
            didRefreshFail = true;
          }
        }
      } catch (error) {
        console.error("bootstrap: unexpected auth init error", error);
        await Promise.allSettled([clearAuthTokens(), clearAuthSession()]);
        storedSession = null;
        hasValidToken = false;
        didRefreshFail = true;
      } finally {
        if (mounted) {
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
        const nextSession = await saveAuthSession(displayName);
        const storedTokens = await loadAuthTokens();
        setSession(nextSession);
        setHasValidAccessToken(storedTokens == null || !shouldRefreshToken(storedTokens));
        setRefreshFailed(false);
        return nextSession;
      } finally {
        setIsSigningIn(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await Promise.allSettled([clearAuthSession(), clearAuthTokens()]);
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
  },
});
