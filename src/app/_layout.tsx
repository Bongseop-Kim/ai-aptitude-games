import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { LoginScreen } from '../components/auth/LoginScreen';
import { useDesignSystemTheme } from '../design-system/provider';
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
  const { fontsLoaded, mode } = useDesignSystemTheme();
  const isReady = fontsLoaded && !isLoading;

  useEffect(() => {
    if (!isReady) return;

    void SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? <RootStack /> : <LoginScreen />}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="games/[id]" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
