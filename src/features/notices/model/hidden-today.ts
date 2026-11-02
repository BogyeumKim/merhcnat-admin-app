import { z } from 'zod';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

const stateSchema = z.object({ date: z.string(), ids: z.array(z.string()) });

/** Local calendar date (YYYY-MM-DD): "today" ends at the device's midnight, whatever the server's time zone is. */
function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The notice ids hidden for today. A stored list from an earlier day counts as empty. Notice ids are not personal data. */
function readHiddenToday(): string[] {
  const raw = storage.getString(STORAGE_KEYS.noticeHiddenToday);
  if (raw === null) return [];
  try {
    const state = stateSchema.safeParse(JSON.parse(raw));
    return state.success && state.data.date === today() ? state.data.ids : [];
  } catch {
    return [];
  }
}

export const isHiddenToday = (id: string) => readHiddenToday().includes(id);

/** "Don't show again today": the notice stays away across sign-ins until the next day. */
export function hideToday(id: string): void {
  const ids = readHiddenToday();
  if (ids.includes(id)) return;
  storage.setString(STORAGE_KEYS.noticeHiddenToday, JSON.stringify({ date: today(), ids: [...ids, id] }));
}
