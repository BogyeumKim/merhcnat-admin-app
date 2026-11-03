import { router } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hideToday, isHiddenToday } from '../model/hidden-today';
import { pageHeightOf } from '../model/notice-layout';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

/** A picture is never taller than this share of the window, so the sheet stays a partial-height sheet. */
const MAX_IMAGE_SHARE = 0.45;

/**
 * Everything the notice sheet needs: the notices (fixed when the sheet opens, so hiding does not reshuffle pages), the
 * page geometry, the current page, and the two exits. "Don't show today" hides every notice in the sheet until tomorrow;
 * "close" only closes it (it comes back after the next sign-in).
 */
export function useNoticePopup() {
  const { data } = usePopupNoticesData();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [notices] = useState(() => (data ?? []).filter((notice) => !isHiddenToday(notice.id)));
  const [index, setIndex] = useState(0);

  const width = windowWidth - insets.left - insets.right;
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
    close: () => router.back(),
    hideAndClose: () => {
      for (const notice of notices) hideToday(notice.id);
      router.back();
    },
  };
}
