import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { isHiddenToday } from '../model/hidden-today';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

const POPUP_PATH = '/notice-popup';
/** A push is swallowed while the verification sheet is still leaving, so it is retried (a few times) until the sheet shows. */
const RETRY_MS = 1200;
const MAX_ATTEMPTS = 5;

/**
 * Mount once inside the signed-in area. After a sign-in it opens the popup sheet once, if the server has a notice that is
 * not hidden for today; the sheet pages through all of them. The ref dies with the signed-in layout, so "close" brings the
 * sheet back after the next sign-in, while "don't show today" is persisted (`hidden-today.ts`).
 */
export function useNoticePopupLauncher(): void {
  const { data } = usePopupNoticesData();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (pathname === POPUP_PATH) shown.current = true;
  }, [pathname]);

  useEffect(() => {
    if (!data || data.every((notice) => isHiddenToday(notice.id))) return;
    let attempts = 0;
    const timer = setInterval(() => {
      if (shown.current || attempts >= MAX_ATTEMPTS) {
        clearInterval(timer);
        return;
      }
      attempts += 1;
      router.push(POPUP_PATH);
    }, RETRY_MS);
    return () => clearInterval(timer);
  }, [data]);
}
