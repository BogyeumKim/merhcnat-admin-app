import KVStore from 'expo-sqlite/kv-store';

import type { StorageKey } from './keys';

/** 동기 key-value 설정 저장소로, expo-sqlite/kv-store 기반(첫 렌더 전에 읽을 수 있음). */
export const storage = {
  getString: (key: StorageKey) => KVStore.getItemSync(key),
  setString: (key: StorageKey, value: string) => KVStore.setItemSync(key, value),
  remove: (key: StorageKey) => KVStore.removeItemSync(key),
};
