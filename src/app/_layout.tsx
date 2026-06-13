import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { LoginScreen } from '../components/auth/LoginScreen';
import { useProfile } from '../data/server/useProfile';
import { useDesignSystemTheme } from '../design-system/provider';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AppProviders } from '../providers/AppProviders';
import { useAuth } from '../providers/AuthProvider';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGate />
    </AppProviders>
  );
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { mode } = useDesignSystemTheme();

  return (
    <>
      {isAuthenticated && !isLoading ? <AuthenticatedGate /> : <UnauthenticatedGate authReady={!isLoading} />}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

function UnauthenticatedGate({ authReady }: { authReady: boolean }) {
  const { fontsLoaded } = useDesignSystemTheme();
  const ready = fontsLoaded && authReady;

  useSplashHide(ready);

  if (!ready) return null;
  return <LoginScreen />;
}

function AuthenticatedGate() {
  const { fontsLoaded } = useDesignSystemTheme();
  // Anonymous sessions also have a profile row (created by the auth trigger),
  // so onboarding is gated purely on onboardedAt, not on the auth method.
  const { data: profile, isLoading } = useProfile();
  // Keep the splash up while fonts and the profile query resolve — no flash.
  const ready = fontsLoaded && !isLoading;

  useSplashHide(ready);

  if (!ready) return null;
  const needsOnboarding = profile != null && profile.onboardedAt == null;
  return needsOnboarding ? <OnboardingScreen /> : <RootStack />;
}

function useSplashHide(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    void SplashScreen.hideAsync();
  }, [ready]);
}

function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="mock-exam" />
      <Stack.Screen name="reports/[id]" />
      <Stack.Screen name="games/[id]" options={{ gestureEnabled: false }} />
      <Stack.Screen name="interview/[id]" />
      <Stack.Screen name="interview/new" options={{ gestureEnabled: false }} />
      <Stack.Screen name="interview/resumes" />
      <Stack.Screen name="interview/postings" />
    </Stack>
  );
}
