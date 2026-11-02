import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { isHiddenToday } from './hidden-today';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

const POPUP_PATH = '/notice-popup';

/**
 * Mount once inside the signed-in area. After a sign-in it opens the popup sheet for each notice that is not hidden for
 * today, one after another (the next one opens when the previous sheet is gone). "Close" only skips a notice for this
 * session (the ref below dies with the signed-in layout), so it shows again after the next sign-in; "don't show today"
 * is persisted (`hidden-today.ts`).
 */
export function useNoticePopupLauncher(): void {
  const { data } = usePopupNoticesData();
  const pathname = usePathname();
  const shown = useRef(new Set<string>());

  useEffect(() => {
    if (!data || pathname === POPUP_PATH) return;
    const next = data.find((notice) => !shown.current.has(notice.id) && !isHiddenToday(notice.id));
    if (!next) return;
    shown.current.add(next.id);
    router.push({ pathname: POPUP_PATH, params: { id: next.id } });
  }, [data, pathname]);
}
