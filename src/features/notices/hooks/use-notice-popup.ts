import { router } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { SHEET_MAX_WIDTH } from '@/shared/theme';

import { hideToday, isHiddenToday } from '../model/hidden-today';
import { pageHeightOf } from '../model/notice-layout';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

/** 이미지는 창 높이의 이 비율을 넘지 않는다. 그래야 시트가 부분 높이로 유지된다. */
const MAX_IMAGE_SHARE = 0.45;

/**
 * 공지 시트에 필요한 모든 것: 공지 목록(시트가 열릴 때 고정해 숨김 처리로 페이지가 재배열되지 않게 함),
 * 페이지 크기, 현재 페이지, 두 가지 닫기 동작. "오늘 하루 보지 않기"는 시트의 모든 공지를 내일까지 숨기고,
 * "닫기"는 닫기만 한다(다음 로그인 후 다시 나타남).
 */
export function useNoticePopup() {
  const { data } = usePopupNoticesData();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [notices] = useState(() => (data ?? []).filter((notice) => !isHiddenToday(notice.id)));
  const [index, setIndex] = useState(0);

  // 페이저는 숫자 폭이 필요하다. Android 시트는 항상 창 전체 폭이고 카드(`SheetSurface`)만 `SHEET_MAX_WIDTH`로 줄어들므로
  // 같은 값으로 제한하면 실제 카드 폭과 같다. iOS는 기존 동작 그대로(창 폭).
  const available = windowWidth - insets.left - insets.right;
  const width = process.env.EXPO_OS === 'android' ? Math.min(available, SHEET_MAX_WIDTH - insets.left - insets.right) : available;
  const maxImageHeight = Math.round(windowHeight * MAX_IMAGE_SHARE);
  const pagerHeight = Math.max(0, ...notices.map((notice) => pageHeightOf(notice, width, maxImageHeight)));

  return {
    notices,
    index,
    setIndex,
    insets,
    width,
    maxImageHeight,
    pagerHeight,
    // 연타로 `back()`이 두 번 불리면 시트 아래 화면까지 닫힌다: 이동 잠금을 거친다.
    close: () => navigateOnce(() => router.back()),
    hideAndClose: () =>
      navigateOnce(() => {
        for (const notice of notices) hideToday(notice.id);
        router.back();
      }),
  };
}
