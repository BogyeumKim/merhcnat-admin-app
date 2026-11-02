/** Every persisted preference key lives here. Secrets (tokens) never go through this storage — use expo-secure-store. */
export const STORAGE_KEYS = {
  language: 'preferences.language',
  /** `{ date, ids }`: sign-in notices hidden for today (`features/notices`). */
  /** '1' when the home amounts are masked (privacy at the counter). */
  hideAmounts: 'home.hideAmounts',
  noticeHiddenToday: 'notices.hiddenToday',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
