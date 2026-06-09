import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider } from 'expo-sqlite';

import { DesignSystemProvider } from '../design-system/provider';
import { LOCAL_DB_NAME, migrateLocalDb } from '../data/local';
import { queryClient } from '../lib/query-client';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <DesignSystemProvider>
      <SQLiteProvider databaseName={LOCAL_DB_NAME} onInit={migrateLocalDb}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SQLiteProvider>
    </DesignSystemProvider>
  );
}
