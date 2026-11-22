import { Column, Picker } from '@expo/ui';
import * as Application from 'expo-application';
import { Stack, router } from 'expo-router';
import { Linking } from 'react-native';

import { SUPPORTED_LANGUAGES, setLanguage, useCurrentLanguage, useTranslation, type Language } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { spacing } from '@/shared/theme';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { usePushPermission } from '../hooks/use-push-permission';

/** 각 언어는 현재 UI 언어와 상관없이 해당 언어로 표시한다. */
const LANGUAGE_NAMES: Record<Language, string> = { ko: '한국어', en: 'English' };

/**
 * 알림 권한(OS 설정에서 관리), 계정(비밀번호 변경), UI 언어(네이티브 메뉴 피커), 앱 정보.
 * 제목은 네이티브 헤더(`Stack.Screen`)가 그린다.
 */
export default function SettingsScreen() {
  const { t } = useTranslation();
  // 구독형: 언어를 바꾸면 피커 선택값도 다시 그려진다(`getCurrentLanguage()`는 렌더 시점 값만 읽는다).
  const language = useCurrentLanguage();
  const push = usePushPermission();
  const pushLabel = {
    checking: t('settings.pushUnknown'),
    granted: t('settings.pushOn'),
    denied: t('settings.pushOff'),
    unavailable: t('settings.pushUnavailable'),
  }[push];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('menu.items.settings.title') }} />
      <TabScreen>
        <Column spacing={spacing.sm} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.notifications')}
          </NativeText>
          <InfoRows rows={[{ label: t('settings.pushStatus'), value: pushLabel }]} />
          <NativeText variant="subhead" tone="secondary">
            {t('settings.pushHint')}
          </NativeText>
          <NativeButton testID="settings-open-system" variant="outlined" label={t('settings.openSystem')} onPress={() => void Linking.openSettings()} />
        </Column>
        <Column spacing={spacing.sm} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.account')}
          </NativeText>
          <NativeButton
            testID="settings-change-password"
            variant="outlined"
            label={t('settings.changePassword')}
            onPress={() => navigateOnce(() => router.push('/settings-password'))}
          />
        </Column>
        <Column spacing={spacing.sm} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.language')}
          </NativeText>
          <Picker
            testID="settings-language"
            accessibilityLabel={t('settings.language')}
            selectedValue={language}
            onValueChange={(language) => void setLanguage(language)}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <Picker.Item key={language} label={LANGUAGE_NAMES[language]} value={language} />
            ))}
          </Picker>
        </Column>
        <Column spacing={spacing.sm} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.about')}
          </NativeText>
          <InfoRows rows={[{ label: t('settings.version'), value: Application.nativeApplicationVersion ?? '-' }]} />
        </Column>
      </TabScreen>
    </>
  );
}
