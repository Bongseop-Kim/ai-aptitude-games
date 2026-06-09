import * as SecureStore from 'expo-secure-store';
import type { SupportedStorage } from '@supabase/supabase-js';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export const secureStoreAuthStorage: SupportedStorage = {
  async getItem(key) {
    return SecureStore.getItemAsync(key, secureStoreOptions);
  },
  async setItem(key, value) {
    await SecureStore.setItemAsync(key, value, secureStoreOptions);
  },
  async removeItem(key) {
    await SecureStore.deleteItemAsync(key, secureStoreOptions);
  },
};
