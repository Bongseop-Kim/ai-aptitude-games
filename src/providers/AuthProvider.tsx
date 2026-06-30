import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { createSessionFromUrl } from '../lib/auth';
import { secureStoreAuthStorage } from '../lib/secure-store-auth-storage';
import { supabase, supabaseAuthStorageKey } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  userId: string | null;
  isAuthenticated: boolean;
  // True while the session belongs to an anonymous (skip-login) user.
  isAnonymous: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isStoredSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const user = record.user;
  return (
    typeof record.access_token === 'string' &&
    typeof record.refresh_token === 'string' &&
    Boolean(user) &&
    typeof user === 'object' &&
    typeof (user as Record<string, unknown>).id === 'string'
  );
}

function isNetworkSessionError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const record = error as Record<string, unknown>;
  const message = typeof record.message === 'string' ? record.message : '';
  return (
    record.name === 'AuthRetryableFetchError' ||
    record.status === 0 ||
    message.includes('fetch failed') ||
    message.includes('Network request failed')
  );
}

async function getStoredSession() {
  try {
    const value = await secureStoreAuthStorage.getItem(supabaseAuthStorageKey);
    if (!value) return null;

    const parsed: unknown = JSON.parse(value);
    return isStoredSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    function subscribeAuthChanges() {
      const { data } = supabase.auth.onAuthStateChange((_event, next) => {
        if (mounted) {
          setSession(next);
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }

    async function loadSession() {
      const storedSession = await getStoredSession();
      let shouldSubscribe = true;

      try {
        const { data, error } = await supabase.auth.getSession();
        const networkError = isNetworkSessionError(error);
        shouldSubscribe = !networkError;
        if (mounted) {
          setSession(data.session ?? (networkError ? storedSession : null));
        }
      } catch (error) {
        const networkError = isNetworkSessionError(error);
        shouldSubscribe = !networkError;
        if (mounted) {
          setSession(networkError ? storedSession : null);
        }
      } finally {
        if (mounted) {
          if (shouldSubscribe) {
            subscribeAuthChanges();
          }
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  // Resolve OAuth redirects (cold start + while running) into a session.
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch(() => {
        // Non-auth deep links land here; ignore.
      });
    }
  }, [url]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      userId: session?.user.id ?? null,
      isAuthenticated: session != null,
      isAnonymous: session?.user.is_anonymous === true,
      isLoading,
    }),
    [session, isLoading],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}
