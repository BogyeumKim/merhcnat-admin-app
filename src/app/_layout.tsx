import '@/shared/i18n';

import type { ErrorBoundaryProps, NativeStackNavigationOptions } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryProvider } from '@/core/providers/query-provider';
import { ensureFreshInstallHandled, useIsSignedIn, useMustChangePassword, useSessionEndedRedirect } from '@/features/auth';
import { SHEET_CORNER_RADIUS, SHEET_MAX_WIDTH, useNativeColors, useWindowLayout } from '@/shared/theme';
import { ErrorScreen } from '@/shared/ui/error-screen';
import { ToastHost } from '@/shared/ui/toast-host';

SplashScreen.preventAutoHideAsync();

/** 재설치 직후 iOS Keychain에 남은 이전 설치의 기기 값을 로그인 전에 지운다(실패해도 로그인을 막지 않는다). */
ensureFreshInstallHandled();

/** 로그인 시트는 로그인 화면 위에 의도적으로 띄운다. 로그인 그룹이 스택의 첫 화면일 때 Expo Router가 경고하므로 이를 감수한다. */
LogBox.ignoreLogs([
  'uses presentation "formSheet" but is the first screen in its native stack',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

/** 어떤 라우트든 렌더링 중 던져진 오류를 받는 최후의 화면 (Expo Router가 레이아웃을 이 화면으로 감싼다). */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

/**
 * 모든 form sheet 공통: 둥근 모서리 28, 불투명 배경(iOS 26은 투명 시트를 Liquid Glass로 그려 뒤 화면이 글자 뒤로 비친다).
 * 그래버: 지금의 시트(verify, login-help, notice-popup)는 모두 아래로 끌어 닫히므로 보인다. 닫을 수 없는 시트를 만들면 `false`로 덮는다.
 * iOS는 네이티브 그래버. Android는 react-native-screens 4.30.1이 이 값을 그리지 않아 시트 내용이 `SheetGrabber`(`SheetFormScreen grabber`)를 그린다.
 * 시트는 `openSheet()`(`shared/lib/open-sheet`)로만 연다: 포커스된 입력란을 먼저 블러해 닫힐 때 키보드가 되살아나지 않게 한다.
 *
 * `floating`(Android, 창 폭 > `SHEET_MAX_WIDTH`): M3는 넓은 화면에서 바텀 시트를 640dp로 가운데 둔다. react-native-screens 4.30.1
 * Android 시트(CoordinatorLayout + BottomSheetBehavior)는 항상 창 전체 폭이고 최대 폭 옵션이 없어, 네이티브 시트를 투명·그림자 없이 두고
 * 시트 내용의 `SheetSurface`가 640dp 가운데 카드를 그린다(양옆은 스크림이 비친다). 네이티브는 이 두 값(배경 tint, elevation)을
 * 시트가 만들어질 때 한 번만 읽는다: 시트를 연 채로 접기/펼치기를 하면 연 시점의 모양이 유지된다(내용 카드는 폭을 따라간다).
 * 폰(창 ≤ 640)은 기존과 같다(불투명 배경, 기본 elevation 24).
 */
function sheetOptions(
  background: string,
  detents: NativeStackNavigationOptions['sheetAllowedDetents'],
  floating: boolean,
): NativeStackNavigationOptions {
  return {
    presentation: 'formSheet',
    sheetGrabberVisible: true,
    sheetCornerRadius: SHEET_CORNER_RADIUS,
    sheetAllowedDetents: detents,
    contentStyle: { backgroundColor: floating ? 'transparent' : background },
    ...(floating ? { sheetElevation: 0 } : null),
  };
}

/**
 * `verify`는 2차 인증 단계로, 로그인 화면 위에 뜨는 시트다. 아래로 드래그, 취소 탭, Android 뒤로가기 제스처로 닫으며,
 * 화면이 제거될 때마다 진행 중이던 인증 요청을 정리한다.
 * 낮은 창(펼친 폴더블 가로 등)·분할 창·큰 글꼴은 전체 높이(`useWindowLayout().prefersFullSheet`). 단계별 값은 `useVerifyFlow`가 덮어쓴다.
 */
const verifySheetOptions = (background: string, full: boolean, floating: boolean) =>
  sheetOptions(background, full ? [1] : process.env.EXPO_OS === 'android' ? [0.72] : [0.7, 1], floating);

/** "로그인이 안 되나요?": 답변이 길어 거의 전체 높이로 띄우는 같은 모양의 시트. */
const helpSheetOptions = (background: string, full: boolean, floating: boolean) =>
  sheetOptions(background, full || process.env.EXPO_OS === 'android' ? [1] : [0.92], floating);

/** 로그인 공지: 탭 화면 위에 내용 높이만큼만 뜨는 바텀 시트 (iOS/Android 모두 부분 높이). */
const noticeSheetOptions = (background: string, floating: boolean) => sheetOptions(background, 'fitToContents', floating);

/** 전체 화면 차단 화면(점검, 필수 업데이트, 보안 위험 기기): 닫을 수 없고 페이드로 덮는다. */
const BLOCKING_SCREEN: NativeStackNavigationOptions = { presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' };
/** 계정 안내(잠김, 정지): 스와이프로 닫지 못하는 모달. */
const ACCOUNT_NOTICE: NativeStackNavigationOptions = { presentation: 'modal', gestureEnabled: false };
const NO_GESTURE: NativeStackNavigationOptions = { gestureEnabled: false };
/**
 * 상태 표시줄 글자/아이콘은 색 모드를 따른다(밝은 배경에 어두운 아이콘). 지정하지 않으면 Android는 react-native-screens 기본값
 * `light`(흰 아이콘)라 밝은 화면에서 보이지 않았다. iOS는 `UIViewControllerBasedStatusBarAppearance=true`라 RN `StatusBar`가 아니라
 * 화면(뷰 컨트롤러) 옵션이 결정한다. 루트 스택의 모든 화면(시트, NativeTabs를 담은 `(tabs)` 포함)이 이 기본값을 물려받는다.
 */
const SCREEN_DEFAULTS_LIGHT: NativeStackNavigationOptions = { headerShown: false, statusBarStyle: 'dark' };
const SCREEN_DEFAULTS_DARK: NativeStackNavigationOptions = { headerShown: false, statusBarStyle: 'light' };

function RootNavigator() {
  useSessionEndedRedirect();
  const isSignedIn = useIsSignedIn();
  const mustChangePassword = useMustChangePassword();
  const { scheme, background } = useNativeColors();
  const { prefersFullSheet, width } = useWindowLayout();
  // Android 넓은 창: 시트를 640dp 가운데 카드로 띄운다(`sheetOptions`). 창 폭만 본다(기기 종류 분기 없음). iOS는 네이티브 page sheet.
  const floatingSheet = process.env.EXPO_OS === 'android' && width > SHEET_MAX_WIDTH;

  return (
    <Stack screenOptions={scheme === 'dark' ? SCREEN_DEFAULTS_DARK : SCREEN_DEFAULTS_LIGHT}>
      <Stack.Protected guard={isSignedIn && mustChangePassword}>
        <Stack.Screen name="password-change" options={NO_GESTURE} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn && !mustChangePassword}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings-password" />
        <Stack.Screen name="feature/[id]" />
        <Stack.Screen name="notice-popup" options={noticeSheetOptions(background, floatingSheet)} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify" options={verifySheetOptions(background, prefersFullSheet, floatingSheet)} />
        <Stack.Screen name="login-help" options={helpSheetOptions(background, prefersFullSheet, floatingSheet)} />
        <Stack.Screen name="temp-password" options={NO_GESTURE} />
      </Stack.Protected>
      <Stack.Screen name="maintenance" options={BLOCKING_SCREEN} />
      <Stack.Screen name="account-locked" options={ACCOUNT_NOTICE} />
      <Stack.Screen name="account-suspended" options={ACCOUNT_NOTICE} />
      <Stack.Screen name="update-required" options={BLOCKING_SCREEN} />
      <Stack.Screen name="insecure-device" options={BLOCKING_SCREEN} />
    </Stack>
  );
}

export default function RootLayout() {
  const { scheme, background } = useNativeColors();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  // 화면 전환 중 비치는 내비게이션 배경을 팔레트 `background`와 맞춘다(기본 테마의 회색 #F2F2F2/검정이 전환 때 번쩍이지 않게).
  const navigationTheme = { ...base, colors: { ...base.colors, background } };

  // hydrate할 것이 없으므로(세션은 메모리에 있고 i18n은 동기 초기화) 앱을 바로 보여준다.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ThemeProvider value={navigationTheme}>
          <RootNavigator />
          <ToastHost />
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
