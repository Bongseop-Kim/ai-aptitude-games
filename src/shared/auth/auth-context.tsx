import { bootstrapAuthSession, clearAuthSession, saveAuthSession, type AuthSession } from "./auth-service";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";

type AuthState = {
  isLoading: boolean;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isSigningIn: boolean;
  signIn: (displayName: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const AuthLoadingFallback = () => (
  <ActivityIndicator size="large" style={{ flex: 1 }} />
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      let storedSession: AuthSession | null = null;
      try {
        storedSession = await bootstrapAuthSession();
      } finally {
        if (mounted) {
          setSession(storedSession);
        }
        if (mounted) {
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
        setSession(nextSession);
        return nextSession;
      } finally {
        setIsSigningIn(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await clearAuthSession();
    setSession(null);
  }, []);

  const value: AuthState = useMemo(
    () => ({
      isLoading,
      session,
      isAuthenticated: session != null,
      isSigningIn,
      signIn,
      signOut,
    }),
    [isLoading, session, isSigningIn, signIn, signOut]
  );

  if (isLoading) {
    return <AuthLoadingFallback />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
