import { ThemedView } from "@/shared/ui/themed-view";
import {
  bootstrapAuthSession,
  clearAuthSession,
  saveAuthSession,
  type AuthSession,
} from "@/shared/auth/auth-service";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

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
  <ThemedView style={styles.loadingFallback}>
    <ActivityIndicator size="large" />
  </ThemedView>
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const storedSession = await bootstrapAuthSession();
        if (mounted) {
          setSession(storedSession);
        }
      } catch (error) {
        console.error("bootstrap: unexpected auth init error", error);
      } finally {
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

  const signIn = useCallback(async (displayName: string) => {
    setIsSigningIn(true);
    try {
      const newSession = await saveAuthSession(displayName);
      setSession(newSession);
      return newSession;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await clearAuthSession();
    } finally {
      setSession(null);
    }
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
