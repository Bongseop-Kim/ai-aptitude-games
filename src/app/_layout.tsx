import { StatusBar } from 'expo-status-bar';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

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
      {isAuthenticated ? <MainTabs /> : <LoginScreen />}
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

function MainTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          md="home"
          sf={{ default: 'house', selected: 'house.fill' }}
        />
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="games">
        <NativeTabs.Trigger.Icon
          md="sports_esports"
          sf={{ default: 'gamecontroller', selected: 'gamecontroller.fill' }}
        />
        <NativeTabs.Trigger.Label>게임</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Icon
          md="insights"
          sf="chart.line.uptrend.xyaxis"
        />
        <NativeTabs.Trigger.Label>기록</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Icon
          md="person"
          sf={{ default: 'person', selected: 'person.fill' }}
        />
        <NativeTabs.Trigger.Label>내 정보</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
