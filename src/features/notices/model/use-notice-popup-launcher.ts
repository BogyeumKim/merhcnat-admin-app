import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { isHiddenToday } from './hidden-today';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

const POPUP_PATH = '/notice-popup';
/** A push can be swallowed while another screen (the verification sheet) is still leaving, so it is retried until the sheet shows. */
const RETRY_AFTER_MS = 1000;

/**
 * Mount once inside the signed-in area. After a sign-in it opens the popup sheet once, if the server has a notice that is
 * not hidden for today; the sheet pages through all of them. The refs die with the signed-in layout, so "close" brings the
 * sheet back after the next sign-in, while "don't show today" is persisted (`hidden-today.ts`).
 */
export function useNoticePopupLauncher(): void {
  const { data } = usePopupNoticesData();
  const pathname = usePathname();
  const shown = useRef(false);
  const lastPush = useRef(0);

  useEffect(() => {
    if (pathname === POPUP_PATH) {
      shown.current = true;
      return;
    }
    if (shown.current || !data || data.every((notice) => isHiddenToday(notice.id))) return;

    const wait = lastPush.current + RETRY_AFTER_MS - Date.now();
    const timer = setTimeout(
      () => {
        lastPush.current = Date.now();
        router.push(POPUP_PATH);
      },
      Math.max(wait, 300),
    );
    return () => clearTimeout(timer);
  }, [data, pathname]);
}
