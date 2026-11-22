import { z } from 'zod';

import type { ApiError } from '@/shared/api/errors';
import { getCurrentLanguage } from '@/shared/i18n';

const isoDate = z.iso.datetime({ offset: true });

/**
 * 계정 잠김 화면의 라우트 대상으로, `ACCOUNT_LOCKED` 오류에서 만든다. 마스킹된 ID와 잠긴 시각은
 * 선택값이다: 오래된 잠금에는 시각이 없고, 서버가 둘 중 하나를 생략할 수도 있다.
 */
export function accountLockedHref(error: ApiError) {
  const userIdMasked = z.string().min(1).safeParse(error.extras.userIdMasked);
  const lockedAt = isoDate.safeParse(error.extras.lockedAt);

  return {
    pathname: '/account-locked' as const,
    params: {
      ...(userIdMasked.success ? { userIdMasked: userIdMasked.data } : {}),
      ...(lockedAt.success ? { lockedAt: lockedAt.data } : {}),
    },
  };
}

/** 오늘 잠겼으면 "오늘 14:05", 아니면 "11월 3일 14:05"(앱 언어로). 시각을 모르면 `null`. */
export function formatLockedAt(value: string | undefined, today: string, now = new Date()): string | null {
  const parsed = isoDate.safeParse(value);
  if (!parsed.success) return null;
  const date = new Date(parsed.data);
  const time = new Intl.DateTimeFormat(getCurrentLanguage(), { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  if (date.toDateString() === now.toDateString()) return `${today} ${time}`;
  return `${new Intl.DateTimeFormat(getCurrentLanguage(), { month: 'long', day: 'numeric' }).format(date)} ${time}`;
}
