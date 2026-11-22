import type { NativeStackNavigationOptions } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { useIsSignedIn, useMustChangePassword, useSessionEndedRedirect } from '@/features/auth';
import { SHEET_CORNER_RADIUS, useNativeColors, useWindowLayout } from '@/shared/theme';

import { useTrackCurrentPath } from './current-path';

/**
 * 모든 form sheet 공통: 둥근 모서리 28, 불투명 배경(iOS 26은 투명 시트를 Liquid Glass로 그려 뒤 화면이 글자 뒤로 비친다).
 * 그래버: 지금의 시트(verify, login-help, notice-popup)는 모두 아래로 끌어 닫히므로 보인다. 닫을 수 없는 시트를 만들면 `false`로 덮는다.
 * iOS는 네이티브 그래버. Android는 react-native-screens 4.30.1이 이 값을 그리지 않아 시트 내용이 `SheetGrabber`(`SheetFormScreen grabber`)를 그린다.
 * 시트는 `openSheet()`(`shared/lib/open-sheet`)로만 연다: 포커스된 입력란을 먼저 블러해 닫힐 때 키보드가 되살아나지 않게 한다.
 *
 * `floating`(Android 전체): 네이티브 시트(react-native-screens 4.30.1, CoordinatorLayout + BottomSheetBehavior)는 항상 창 전체 폭이고
 * 최대 폭·위 여백 옵션이 없다. 그래서 네이티브 시트를 투명·그림자 없이 두고 시트 내용의 `SheetSurface`가 M3 바텀 시트 카드
 * (최대 640dp 가운데, 전체 높이 시트는 창 맨 위에서 `SHEET_TOP_GAP`만큼 띄움)를 그린다. 카드 바깥(양옆, 위)으로 스크림이 비친다.
 * 창 폭과 상관없이 항상 투명이라, 시트를 연 채로 접기/펼치기해도 네이티브 배경이 남지 않는다(배경 tint·elevation은 생성 때 한 번만 읽힌다).
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
 * 낮은 창(펼친 폴더블 가로 등)·분할 창·큰 글꼴은 최대 높이(`useWindowLayout().prefersFullSheet`). 단계별 값은 `useVerifyFlow`가 덮어쓴다.
 * 최대 높이(`fullDetent`)도 창 맨 위까지 올라가지 않는다: iOS 넓은 창은 1보다 작은 비율, 그 외 1(`useWindowLayout().fullSheetDetent`).
 */
const verifySheetOptions = (background: string, full: boolean, fullDetent: number, floating: boolean) =>
  sheetOptions(background, full ? [fullDetent] : process.env.EXPO_OS === 'android' ? [0.72] : [0.7, 1], floating);

/** "로그인이 안 되나요?": 답변이 길어 최대 높이로 띄우는 같은 모양의 시트(iOS 휴대폰 세로는 0.92). */
const helpSheetOptions = (background: string, full: boolean, fullDetent: number, floating: boolean) =>
  sheetOptions(background, full ? [fullDetent] : process.env.EXPO_OS === 'android' ? [1] : [0.92], floating);

/** 로그인 공지: 탭 화면 위에 내용 높이만큼만 뜨는 바텀 시트 (iOS/Android 모두 부분 높이). */
const noticeSheetOptions = (background: string, floating: boolean) => sheetOptions(background, 'fitToContents', floating);

/** 전체 화면 차단 화면(점검, 필수 업데이트, 보안 위험 기기): 닫을 수 없고 페이드로 덮는다. */
const BLOCKING_SCREEN: NativeStackNavigationOptions = { presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' };
/** 계정 안내(잠김, 정지): 스와이프로 닫지 못하는 모달. */
const ACCOUNT_NOTICE: NativeStackNavigationOptions = { presentation: 'modal', gestureEnabled: false };
const NO_GESTURE: NativeStackNavigationOptions = { gestureEnabled: false };
/** 필수 공지: 뒤 화면 위에 투명하게 뜨는 가운데 다이얼로그. 스와이프로 닫히지 않고 [확인]으로만 닫힌다(뒤로가기는 화면 훅이 막음). */
const REQUIRED_NOTICE: NativeStackNavigationOptions = { presentation: 'transparentModal', animation: 'fade', gestureEnabled: false };
/**
 * 상태 표시줄 글자/아이콘은 색 모드를 따른다(밝은 배경에 어두운 아이콘). 지정하지 않으면 Android는 react-native-screens 기본값
 * `light`(흰 아이콘)라 밝은 화면에서 보이지 않았다. iOS는 `UIViewControllerBasedStatusBarAppearance=true`라 RN `StatusBar`가 아니라
 * 화면(뷰 컨트롤러) 옵션이 결정한다. 루트 스택의 모든 화면(시트, NativeTabs를 담은 `(tabs)` 포함)이 이 기본값을 물려받는다.
 */
const SCREEN_DEFAULTS_LIGHT: NativeStackNavigationOptions = { headerShown: false, statusBarStyle: 'dark' };
const SCREEN_DEFAULTS_DARK: NativeStackNavigationOptions = { headerShown: false, statusBarStyle: 'light' };

export function RootNavigator() {
  useSessionEndedRedirect();
  useTrackCurrentPath();
  const isSignedIn = useIsSignedIn();
  const mustChangePassword = useMustChangePassword();
  const { scheme, background } = useNativeColors();
  const { prefersFullSheet, fullSheetDetent } = useWindowLayout();
  // Android: 시트 모양(폭, 위 여백)은 `SheetSurface` 카드가 그린다(`sheetOptions`). iOS는 네이티브 시트.
  const floatingSheet = process.env.EXPO_OS === 'android';

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
        <Stack.Screen name="notice-required" options={REQUIRED_NOTICE} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify" options={verifySheetOptions(background, prefersFullSheet, fullSheetDetent, floatingSheet)} />
        <Stack.Screen name="login-help" options={helpSheetOptions(background, prefersFullSheet, fullSheetDetent, floatingSheet)} />
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
