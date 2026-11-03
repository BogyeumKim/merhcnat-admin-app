import { z } from 'zod';

import type { ApiError } from '@/shared/api/errors';

const isoDate = z.iso.datetime({ offset: true });

/**
 * Route target for the maintenance screen, built from a `MAINTENANCE` error. The period is passed as ISO strings;
 * each end is validated on its own so one malformed value does not discard the other.
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

/** "약 1시간 20분" until the end of the window, or `null` when the end is unknown or already past. */
export function formatRemaining(endAt: string | undefined, t: Translate, now = Date.now()): string | null {
  const end = isoDate.safeParse(endAt);
  if (!end.success) return null;
  const totalMinutes = Math.ceil((new Date(end.data).getTime() - now) / 60_000);
  if (totalMinutes <= 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? t('maintenance.remainingHoursMinutes', { hours, minutes }) : t('maintenance.remainingMinutes', { minutes });
}
