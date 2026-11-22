import { Column } from '@expo/ui';
import * as Application from 'expo-application';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/** 홈 화면 맨 아래의 조용한 블록: 약관 링크와 앱 버전. */
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
