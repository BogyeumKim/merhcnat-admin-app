import { z } from 'zod';

import type { ApiError } from '@/shared/api/errors';
import { getCurrentLanguage, type Language } from '@/shared/i18n';

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

type LockedAtFormatters = { time: Intl.DateTimeFormat; day: Intl.DateTimeFormat };

/** `Intl` 포맷터 생성은 비싸므로 언어별로 한 번만 만든다. 언어를 바꾸면 새 언어의 포맷터를 쓴다. */
const formatterCache = new Map<Language, LockedAtFormatters>();
function lockedAtFormatters(): LockedAtFormatters {
  const language = getCurrentLanguage();
  let formatters = formatterCache.get(language);
  if (!formatters) {
    formatters = {
      time: new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit', hour12: false }),
      day: new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric' }),
    };
    formatterCache.set(language, formatters);
  }
  return formatters;
}

/** 오늘 잠겼으면 "오늘 14:05", 아니면 "11월 3일 14:05"(앱 언어로). 시각을 모르면 `null`. */
export function formatLockedAt(value: string | undefined, today: string, now = new Date()): string | null {
  const parsed = isoDate.safeParse(value);
  if (!parsed.success) return null;
  const date = new Date(parsed.data);
  const formatters = lockedAtFormatters();
  const time = formatters.time.format(date);
  if (date.toDateString() === now.toDateString()) return `${today} ${time}`;
  return `${formatters.day.format(date)} ${time}`;
}
