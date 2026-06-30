import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider } from 'expo-sqlite';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { DesignSystemProvider } from '../design-system/provider';
import { LOCAL_DB_NAME, migrateLocalDb } from '../data/local/database';
import { GameResultsSyncBridge } from '../data/sync/GameResultsSyncBridge';
import { queryClient } from '../lib/query-client';
import { SnackbarProvider } from '../components/ui/Snackbar';
import { AuthProvider } from './AuthProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <DesignSystemProvider>
        <SQLiteProvider databaseName={LOCAL_DB_NAME} onInit={migrateLocalDb}>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider>
              <AuthProvider>
                <GameResultsSyncBridge />
                {children}
              </AuthProvider>
            </SnackbarProvider>
          </QueryClientProvider>
        </SQLiteProvider>
      </DesignSystemProvider>
    </SafeAreaProvider>
  );
}
