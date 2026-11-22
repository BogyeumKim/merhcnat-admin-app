import { Column } from '@expo/ui';
import * as Application from 'expo-application';

import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';

/** 로그인 화면 맨 아래의 앱 버전 한 줄. */
export function AppVersionNote() {
  const { t } = useTranslation();

  return (
    <Column alignment="center" style={{ width: '100%' }}>
      <NativeText variant="caption" tone="secondary" center>
        {t('auth.version', { version: Application.nativeApplicationVersion ?? '' })}
      </NativeText>
    </Column>
  );
}
