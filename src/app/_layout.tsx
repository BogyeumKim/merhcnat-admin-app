import '@/shared/i18n';

import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

import { RootNavigator } from '@/core/navigation/root-stack';
import { AppProviders } from '@/core/providers/app-providers';
import { ensureFreshInstallHandled } from '@/features/auth';
import { ErrorScreen } from '@/shared/ui/error-screen';

SplashScreen.preventAutoHideAsync();

/** 재설치 직후 iOS Keychain에 남은 이전 설치의 기기 값을 로그인 전에 지운다(실패해도 로그인을 막지 않는다). */
ensureFreshInstallHandled();

/**
 * 로그인 시트는 로그인 화면 위에 의도적으로 띄운다. 로그인 그룹이 스택의 첫 화면일 때 Expo Router가 경고하므로 이를 감수한다.
 * 차단 화면(점검·업데이트)은 스택을 비우고 단독으로 남기므로(뒤로 돌아갈 화면이 없어야 함) 카드로 그려진다는 같은 경고를 감수한다.
 */
LogBox.ignoreLogs([
  'uses presentation "formSheet" but is the first screen in its native stack',
  'uses presentation "fullScreenModal" but is the first screen in its native stack',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

/** 어떤 라우트든 렌더링 중 던져진 오류를 받는 최후의 화면 (Expo Router가 레이아웃을 이 화면으로 감싼다). */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

/** 라우트 파일은 얇게: 스택·가드·시트 옵션은 `core/navigation/root-stack`, provider는 `core/providers/app-providers`. */
export default function RootLayout() {
  // hydrate할 것이 없으므로(세션은 메모리에 있고 i18n은 동기 초기화) 앱을 바로 보여준다.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
