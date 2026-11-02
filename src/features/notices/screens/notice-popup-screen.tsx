import { Column } from '@expo/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeHost } from '@/shared/ui/native-host';

import { NoticePage } from '../components/notice-page';
import { PageDots } from '../components/page-dots';
import { hideToday, isHiddenToday } from '../model/hidden-today';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

/**
 * The sign-in notices as one bottom sheet (the form-sheet route pattern the verification step uses). Several notices are
 * a swipeable carousel with page dots; "don't show today" hides every notice in the sheet until tomorrow, "close" only
 * closes it (it comes back after the next sign-in). The list is fixed when the sheet opens, so hiding does not reshuffle pages.
 */
export default function NoticePopupScreen() {
  const { t } = useTranslation();
  const { data } = usePopupNoticesData();
  const insets = useSafeAreaInsets();
  const [notices] = useState(() => (data ?? []).filter((notice) => !isHiddenToday(notice.id)));
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [index, setIndex] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const hideAndClose = () => {
    for (const notice of notices) hideToday(notice.id);
    router.back();
  };

  return (
    <View style={{ flex: 1, paddingLeft: insets.left, paddingRight: insets.right }}>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {size ? (
          <FlatList
            data={notices}
            keyExtractor={(notice) => notice.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / size.width))}
            renderItem={({ item }) => <NoticePage notice={item} width={size.width} height={size.height} />}
          />
        ) : null}
      </View>
      {notices.length > 1 ? <PageDots count={notices.length} index={index} label={`${index + 1} / ${notices.length}`} /> : null}
      <NativeHost>
        <Column spacing={spacing.sm} style={{ width: '100%', padding: spacing.md, paddingBottom: insets.bottom + spacing.md }}>
          <NativeButton testID="notice-hide-today" variant="outlined" label={t('notices.hideToday')} onPress={hideAndClose} />
          <NativeButton testID="notice-close" label={t('notices.close')} onPress={() => router.back()} />
        </Column>
      </NativeHost>
    </View>
  );
}
