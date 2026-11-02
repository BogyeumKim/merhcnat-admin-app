import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { colors } from '@/shared/theme';

import { NativeButton } from './native-button';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';
import { NativeText } from './native-text';

type ErrorScreenProps = {
  /** Already translated, user-facing message. */
  message?: string;
  onRetry?: () => void;
};

/** Full-screen fallback for crashes and unrecoverable errors. Scrolls natively, so nothing is clipped at any text size. */
export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom}>
          <NativeText variant="title">{t('errors.screenTitle')}</NativeText>
          <NativeText tone="secondary">{message ?? t('errors.UNKNOWN')}</NativeText>
          {onRetry ? <NativeButton label={t('common.retry')} onPress={onRetry} /> : null}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
