/** Every persisted preference key lives here. Secrets (tokens) never go through this storage — use expo-secure-store. */
export const STORAGE_KEYS = {
  language: 'preferences.language',
  /** `{ date, ids }`: sign-in notices hidden for today (`features/notices`). */
  noticeHiddenToday: 'notices.hiddenToday',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
