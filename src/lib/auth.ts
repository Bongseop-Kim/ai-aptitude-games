import type { Provider } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from './supabase';

// Completes any pending auth session left in the browser (web/dev safety).
WebBrowser.maybeCompleteAuthSession();

export class IdentityConflictError extends Error {
  constructor() {
    super('This identity is already linked to another account.');
    this.name = 'IdentityConflictError';
  }
}

// Custom-scheme redirect (e.g. aiaptitudegames://). Must be registered in the
// Supabase dashboard auth URL configuration and each provider's redirect list.
export const authRedirectTo = makeRedirectUri();

// Turn the redirect URL into a session. Supports both PKCE (?code=) and
// implicit (access_token/refresh_token) responses.
export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { code, access_token, refresh_token } = params;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }

  if (access_token) {
    if (!refresh_token) {
      throw new Error('Auth redirect returned an access token without a refresh token.');
    }
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}

// Opens the provider's OAuth page in an auth session browser and resolves the
// redirect back into a Supabase session. Returns null if the user cancels.
export async function signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('OAuth URL was not returned by Supabase.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo);
  if (result.type === 'success') {
    return createSessionFromUrl(result.url);
  }
  return null;
}

export function signInWithKakao() {
  return signInWithProvider('kakao');
}

// Upgrade the current anonymous session to a permanent account by linking a
// social identity. Keeps the same user id, so rows already synced to the
// server stay attached. When the identity already belongs to another account,
// report a conflict instead of replacing the current anonymous user.
export async function linkWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo: authRedirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('OAuth URL was not returned by Supabase.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo);
  if (result.type !== 'success') {
    return null;
  }
  // GoTrue reports link conflicts via redirect error params, not a thrown error.
  const { errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode === 'identity_already_exists') {
    throw new IdentityConflictError();
  }
  return createSessionFromUrl(result.url);
}

export function linkKakao() {
  return linkWithProvider('kakao');
}

// Skip social login: start an anonymous session. The auth.users insert trigger
// creates a profile, so onboarding/home work the same. Can be upgraded to a
// permanent account later via linkIdentity / updateUser.
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
