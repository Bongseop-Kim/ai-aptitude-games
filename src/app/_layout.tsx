import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoginScreen } from '../components/auth/LoginScreen';
import { useDesignSystemTheme } from '../design-system/provider';
import { AppProviders } from '../providers/AppProviders';
import { useAuth } from '../providers/AuthProvider';

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

  if (isLoading) {
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
