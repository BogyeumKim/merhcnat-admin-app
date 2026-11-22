import { z } from 'zod';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

const stateSchema = z.object({ date: z.string(), ids: z.array(z.string()) });

/** 로컬 달력 날짜(YYYY-MM-DD): "오늘"은 서버 시간대와 무관하게 기기의 자정에 끝난다. */
function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 오늘 숨긴 공지 id 목록. 이전 날짜에 저장된 목록은 빈 것으로 간주한다. 공지 id는 개인정보가 아니다. */
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

/** "오늘 하루 보지 않기": 다음 날까지 로그인을 거쳐도 공지가 다시 나타나지 않는다. */
export function hideToday(id: string): void {
  const ids = readHiddenToday();
  if (ids.includes(id)) return;
  storage.setString(STORAGE_KEYS.noticeHiddenToday, JSON.stringify({ date: today(), ids: [...ids, id] }));
}
