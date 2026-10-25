import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';

import { AppText } from './app-text';
import { NativeButton } from './native-button';
import { NativeHost } from './native-host';

type ErrorScreenProps = {
  /** Already translated, user-facing message. */
  message?: string;
  onRetry?: () => void;
};

/** Full-screen fallback for crashes and unrecoverable errors. Scrolls, so nothing is clipped at any text size. */
export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
      }}>
      <AppText variant="title" accessibilityRole="header">
        {t('errors.screenTitle')}
      </AppText>
      <AppText tone="secondary">{message ?? t('errors.UNKNOWN')}</AppText>
      {onRetry ? (
        <NativeHost>
          <NativeButton label={t('common.retry')} onPress={onRetry} />
        </NativeHost>
      ) : null}
    </ScrollView>
  );
}
