import { useQuery } from '@tanstack/react-query';

import { fetchPopupNotices } from '../api/notice-api';

export const noticeQueryKeys = { popup: ['notices', 'popup'] as const };

/** Notices to show at sign-in. Failing to load them is not worth an error screen: the popup just does not appear. */
export function usePopupNoticesData() {
  return useQuery({ queryKey: noticeQueryKeys.popup, queryFn: fetchPopupNotices, staleTime: 5 * 60 * 1000 });
}
