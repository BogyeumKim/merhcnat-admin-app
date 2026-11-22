import { router } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { SHEET_MAX_WIDTH } from '@/shared/theme';

import { getHiddenTodayIds, hideToday } from '../model/hidden-today';
import { pageHeightOf } from '../model/notice-layout';
import { sheetNoticesOf } from '../model/notice-queue';
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
  // 필수 공지는 다이얼로그(`/notice-required`)가 따로 보여준다. 시트는 일반 공지만.
  const [notices] = useState(() => sheetNoticesOf(data ?? [], getHiddenTodayIds()));
  const [index, setIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  // 페이저는 숫자 폭이 필요하다. 실제 폭은 시트 내용 컨테이너의 `onLayout`으로 잰다(iOS 넓은 창의 가운데 카드 시트,
  // Android `SheetSurface` 640dp 카드 모두 실제 폭을 따른다). 첫 측정 전 한 프레임만 플랫폼 관례로 추정해 시트 높이가 튀지 않게 한다.
  const estimate = (process.env.EXPO_OS === 'android' ? Math.min(windowWidth, SHEET_MAX_WIDTH) : windowWidth) - insets.left - insets.right;
  const width = measuredWidth ?? estimate;
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
    /** 시트 내용 컨테이너(좌우 inset 패딩 포함)의 폭을 재 페이저 폭으로 쓴다. */
    onContainerLayout: (event: LayoutChangeEvent) => {
      const next = Math.round(event.nativeEvent.layout.width - insets.left - insets.right);
      if (next > 0 && next !== measuredWidth) setMeasuredWidth(next);
    },
    // 연타로 `back()`이 두 번 불리면 시트 아래 화면까지 닫힌다: 이동 잠금을 거친다.
    close: () => navigateOnce(() => router.back()),
    hideAndClose: () =>
      navigateOnce(() => {
        hideToday(notices.map((notice) => notice.id));
        router.back();
      }),
  };
}
