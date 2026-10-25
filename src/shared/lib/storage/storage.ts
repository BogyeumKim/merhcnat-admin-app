import KVStore from 'expo-sqlite/kv-store';

import type { StorageKey } from './keys';

/** Synchronous key-value preferences, backed by expo-sqlite/kv-store (readable before first render). */
export const storage = {
  getString: (key: StorageKey) => KVStore.getItemSync(key),
  setString: (key: StorageKey, value: string) => KVStore.setItemSync(key, value),
  remove: (key: StorageKey) => KVStore.removeItemSync(key),
};
