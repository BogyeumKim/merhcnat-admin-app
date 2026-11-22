import { z } from 'zod';

import type { ApiError } from '@/shared/api/errors';

const isoDate = z.iso.datetime({ offset: true });

/**
 * 점검 화면의 라우트 대상. `MAINTENANCE` 오류로부터 만든다. 기간은 ISO 문자열로 전달하며,
 * 한쪽 값이 잘못되어도 다른 쪽이 버려지지 않도록 양 끝을 각각 검증한다.
 */
export function maintenanceHref(error: ApiError) {
  const startAt = isoDate.safeParse(error.extras.startAt);
  const endAt = isoDate.safeParse(error.extras.endAt);

  return {
    pathname: '/maintenance' as const,
    params: {
      ...(startAt.success ? { startAt: startAt.data } : {}),
      ...(endAt.success ? { endAt: endAt.data } : {}),
    },
  };
}

type Translate = (key: 'maintenance.remainingHoursMinutes' | 'maintenance.remainingMinutes', options: { hours?: number; minutes: number }) => string;

/** "약 1시간 20분" 점검 종료까지 남은 시간. 종료 시각을 모르거나 이미 지났으면 `null`. */
export function formatRemaining(endAt: string | undefined, t: Translate, now = Date.now()): string | null {
  const end = isoDate.safeParse(endAt);
  if (!end.success) return null;
  const totalMinutes = Math.ceil((new Date(end.data).getTime() - now) / 60_000);
  if (totalMinutes <= 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? t('maintenance.remainingHoursMinutes', { hours, minutes }) : t('maintenance.remainingMinutes', { minutes });
}
