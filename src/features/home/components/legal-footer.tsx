import { Column } from '@expo/ui';
import * as Application from 'expo-application';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/** The quiet last block of the home page: legal links and the app version. */
export function LegalFooter() {
  const { t } = useTranslation();

  return (
    <Column spacing={spacing.xs} style={{ width: '100%', paddingHorizontal: spacing.xs, paddingBottom: spacing.md }}>
      <NativeText variant="caption" tone="secondary">
        {`${t('home.legalTerms')}  ·  ${t('home.legalPrivacy')}  ·  ${t('home.legalEft')}`}
      </NativeText>
      <NativeText variant="caption" tone="secondary">
        {t('home.version', { version: Application.nativeApplicationVersion ?? '' })}
      </NativeText>
    </Column>
  );
}
