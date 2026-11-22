import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { spacing } from '@/shared/theme';

import { REQUIRED_DIALOG } from '../components/config/required-dialog';
import { pageHeightOf } from '../model/notice-layout';
import { requiredNoticesOf } from '../model/notice-queue';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

/**
 * 필수 공지 다이얼로그의 동작: 필수 공지를 하나씩 보여주고 [확인]을 누를 때만 다음으로 넘어가거나 닫는다.
 * 바깥 탭·스와이프(라우트 옵션)와 Android 뒤로가기로는 닫히지 않는다. "오늘 하루 보지 않기"는 없다.
 */
export function useRequiredNotice() {
  const { data } = usePopupNoticesData();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  // 열릴 때 목록을 고정한다(백그라운드 refetch로 순서가 바뀌지 않게).
  const [notices] = useState(() => requiredNoticesOf(data ?? []));
  const [index, setIndex] = useState(0);

  useBlockBackButton();

  // 보여줄 공지가 없으면(오래된 링크, 캐시 없음) 바로 닫는다.
  useEffect(() => {
    if (notices.length === 0 && router.canGoBack()) router.back();
  }, [notices.length]);

  const width = Math.min(windowWidth - spacing.lg * 2, REQUIRED_DIALOG.maxWidth);
  const maxImageHeight = Math.round(windowHeight * REQUIRED_DIALOG.maxImageShare);
  const notice = notices[index] ?? null;

  return {
    notice,
    width,
    maxImageHeight,
    pageHeight: notice ? pageHeightOf(notice, width, maxImageHeight) : 0,
    /** 여러 건이면 "1 / 2". 한 건이면 `null`. */
    position: notices.length > 1 ? { index: index + 1, count: notices.length } : null,
    confirm: () => {
      if (index < notices.length - 1) setIndex(index + 1);
      else navigateOnce(() => router.back());
    },
  };
}
