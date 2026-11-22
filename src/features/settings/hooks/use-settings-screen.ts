import { router } from 'expo-router';
import { Linking } from 'react-native';

import { setLanguage, useCurrentLanguage, useTranslation, type Language } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';

import { usePushPermission } from './use-push-permission';

/**
 * 설정 화면의 동작: 알림 권한 표시 문구, OS 설정 열기, 비밀번호 변경 이동, 언어 변경.
 * 화면(`settings-screen.tsx`)은 렌더링만 한다.
 */
export function useSettingsScreen() {
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

  return {
    language,
    pushLabel,
    openSystemSettings: () => void Linking.openSettings(),
    openChangePassword: () => navigateOnce(() => router.push('/settings-password')),
    changeLanguage: (next: Language) => void setLanguage(next),
  };
}
