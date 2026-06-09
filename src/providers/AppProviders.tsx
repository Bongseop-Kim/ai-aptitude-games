import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DesignSystemProvider } from '../design-system/provider';
import { LOCAL_DB_NAME, migrateLocalDb } from '../data/local/database';
import { queryClient } from '../lib/query-client';
import { AuthProvider } from './AuthProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <DesignSystemProvider>
        <SQLiteProvider databaseName={LOCAL_DB_NAME} onInit={migrateLocalDb}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        </SQLiteProvider>
      </DesignSystemProvider>
    </SafeAreaProvider>
  );
}
