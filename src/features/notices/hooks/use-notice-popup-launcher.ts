import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { openSheet } from '@/shared/lib/open-sheet';

import { getHiddenTodayIds } from '../model/hidden-today';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

const POPUP_PATH = '/notice-popup';
/** 인증 시트가 사라지는 중에는 push가 무시되므로, 시트가 뜰 때까지 몇 번 재시도한다. */
const RETRY_MS = 1200;
const MAX_ATTEMPTS = 5;

/**
 * 로그인 영역 안에서 한 번만 마운트한다. 로그인 후, 서버에 오늘 숨기지 않은 공지가 있으면 팝업 시트를 한 번 연다.
 * 시트는 모든 공지를 페이지로 넘겨 보여준다. ref는 로그인 레이아웃과 함께 사라지므로 "닫기"는 다음 로그인 후
 * 시트를 다시 띄우고, "오늘 하루 보지 않기"는 저장된다(`hidden-today.ts`).
 */
export function useNoticePopupLauncher(): void {
  const { data } = usePopupNoticesData();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (pathname === POPUP_PATH) shown.current = true;
  }, [pathname]);

  useEffect(() => {
    if (!data) return;
    const hidden = getHiddenTodayIds();
    if (data.every((notice) => hidden.has(notice.id))) return;
    let attempts = 0;
    const timer = setInterval(() => {
      if (shown.current || attempts >= MAX_ATTEMPTS) {
        clearInterval(timer);
        return;
      }
      attempts += 1;
      void openSheet(POPUP_PATH);
    }, RETRY_MS);
    return () => clearInterval(timer);
  }, [data]);
}
