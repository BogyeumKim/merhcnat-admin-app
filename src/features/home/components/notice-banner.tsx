import { Column } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/** One promo-style card for what the operator wants merchants to see (notices, service news). */
export function NoticeBanner({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column
      testID="home-notice"
      onPress={onPress}
      spacing={spacing.xs}
      style={{ width: '100%', padding: spacing.lg, borderRadius: 24, backgroundColor: colors.field }}>
      <NativeText variant="caption" tone="secondary">
        {t('home.noticeLabel')}
      </NativeText>
      <NativeText variant="headline">{t('home.noticeBanner')}</NativeText>
    </Column>
  );
}
