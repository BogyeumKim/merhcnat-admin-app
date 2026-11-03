import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { NoticeActions } from '../components/notice-actions';
import { NoticePage } from '../components/notice-page';
import { PageDots } from '../components/page-dots';
import { hideToday, isHiddenToday } from '../model/hidden-today';
import { pageHeightOf } from '../model/notice-layout';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

/** A picture is never taller than this share of the window, so the sheet stays a partial-height sheet. */
const MAX_IMAGE_SHARE = 0.45;

/**
 * The sign-in notices as one bottom sheet sized to its content (`fitToContents`, so it is partial height on iOS and
 * Android alike). Several notices are a swipeable carousel with page dots; the sheet is as tall as the tallest page.
 * "Don't show today" hides every notice in the sheet until tomorrow, "close" only closes it (it comes back after the next
 * sign-in). The list is fixed when the sheet opens, so hiding does not reshuffle pages.
 */
export default function NoticePopupScreen() {
  const { data } = usePopupNoticesData();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const width = windowWidth - insets.left - insets.right;
  const [notices] = useState(() => (data ?? []).filter((notice) => !isHiddenToday(notice.id)));
  const [index, setIndex] = useState(0);

  const maxImageHeight = Math.round(windowHeight * MAX_IMAGE_SHARE);
  const pagerHeight = Math.max(0, ...notices.map((notice) => pageHeightOf(notice, width, maxImageHeight)));

  const hideAndClose = () => {
    for (const notice of notices) hideToday(notice.id);
    router.back();
  };

  return (
    <View style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
      <View style={{ height: pagerHeight }}>
        <FlatList
          data={notices}
          keyExtractor={(notice) => notice.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => <NoticePage notice={item} width={width} height={pagerHeight} maxImageHeight={maxImageHeight} />}
        />
      </View>
      {notices.length > 1 ? <PageDots count={notices.length} index={index} label={`${index + 1} / ${notices.length}`} /> : null}
      <NoticeActions onHideToday={hideAndClose} onClose={() => router.back()} bottomInset={insets.bottom} />
    </View>
  );
}
