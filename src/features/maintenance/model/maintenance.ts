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
