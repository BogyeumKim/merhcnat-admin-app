import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { openSheet } from '@/shared/lib/open-sheet';

import { getHiddenTodayIds } from '../model/hidden-today';
import { requiredNoticesOf, sheetNoticesOf } from '../model/notice-queue';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

const SHEET_PATH = '/notice-popup';
const REQUIRED_PATH = '/notice-required';
/** 인증 시트가 사라지는 중에는 push가 무시되므로, 화면이 뜰 때까지 몇 번 재시도한다. */
const RETRY_MS = 1200;
const MAX_ATTEMPTS = 5;

type Step = 'required' | 'sheet' | 'done';

/**
 * 로그인 영역 안에서 한 번만 마운트한다. 로그인 후 서버 공지를 한 번씩 띄운다:
 * 필수 공지가 있으면 먼저 가운데 다이얼로그(`/notice-required`, [확인]으로만 닫힘), 그다음 오늘 숨기지 않은 일반 공지가 있으면
 * 바텀 시트(`/notice-popup`). ref는 로그인 레이아웃과 함께 사라지므로 다음 로그인 후 다시 뜨고,
 * "오늘 하루 보지 않기"는 저장된다(`hidden-today.ts`).
 */
export function useNoticePopupLauncher(): void {
  const { data } = usePopupNoticesData();
  const pathname = usePathname();
  const path = useRef(pathname);
  const visited = useRef(new Set<string>());

  useEffect(() => {
    path.current = pathname;
    visited.current.add(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!data) return;
    const hasRequired = requiredNoticesOf(data).length > 0;
    const hasSheet = sheetNoticesOf(data, getHiddenTodayIds()).length > 0;
    let step: Step = hasRequired ? 'required' : hasSheet ? 'sheet' : 'done';
    let attempts = 0;
    const timer = setInterval(() => {
      if (step === 'required') {
        if (!visited.current.has(REQUIRED_PATH) && attempts < MAX_ATTEMPTS) {
          attempts += 1;
          navigateOnce(() => router.push(REQUIRED_PATH));
          return;
        }
        // 다이얼로그가 떠 있는 동안 기다린다. 닫히면(또는 끝내 뜨지 못하면) 일반 공지로 넘어간다.
        if (path.current === REQUIRED_PATH) return;
        step = hasSheet ? 'sheet' : 'done';
        attempts = 0;
      }
      if (step === 'sheet' && !visited.current.has(SHEET_PATH) && attempts < MAX_ATTEMPTS) {
        attempts += 1;
        void openSheet(SHEET_PATH);
        return;
      }
      clearInterval(timer);
    }, RETRY_MS);
    return () => clearInterval(timer);
  }, [data]);
}
