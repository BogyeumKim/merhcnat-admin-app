import { Column } from '@expo/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeFormScroll } from '@/shared/ui/native-form-scroll';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

import { NoticeImage } from '../components/notice-image';
import { hideToday } from '../model/hidden-today';
import { usePopupNoticesData } from '../queries/use-popup-notices-data';

/**
 * The sign-in notice, presented as a bottom sheet (the form-sheet route pattern the verification step uses): optional
 * image on top, the server's title and plain-text body, then "don't show today" and "close". Closing leaves the notice
 * eligible for the next sign-in; the other button hides it until tomorrow.
 */
export default function NoticePopupScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = usePopupNoticesData();
  const insets = useSafeAreaInsets();
  const notice = data?.find((candidate) => candidate.id === id);

  const close = () => router.back();
  const hideAndClose = () => {
    if (notice) hideToday(notice.id);
    router.back();
  };

  return (
    <View style={{ flex: 1, paddingLeft: insets.left, paddingRight: insets.right }}>
      {notice?.image ? <NoticeImage image={notice.image} /> : null}
      <NativeHost fill>
        <NativeFormScroll
          bottomInset={insets.bottom}
          footer={
            <Column spacing={spacing.sm} style={{ width: '100%' }}>
              <NativeButton testID="notice-hide-today" variant="outlined" label={t('notices.hideToday')} onPress={hideAndClose} />
              <NativeButton testID="notice-close" label={t('notices.close')} onPress={close} />
            </Column>
          }>
          {notice ? (
            <>
              <NativeText variant="title">{notice.title}</NativeText>
              <NativeText>{notice.body}</NativeText>
            </>
          ) : null}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
