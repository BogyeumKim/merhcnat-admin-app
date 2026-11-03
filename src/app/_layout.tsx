import '@/shared/i18n';

import type { ErrorBoundaryProps, NativeStackNavigationOptions } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryProvider } from '@/core/providers/query-provider';
import { useIsSignedIn, useMustChangePassword } from '@/features/auth';
import { colors } from '@/shared/theme';
import { ErrorScreen } from '@/shared/ui/error-screen';
import { ToastHost } from '@/shared/ui/toast-host';

SplashScreen.preventAutoHideAsync();

/** The sign-in sheet is deliberately presented over the sign-in screen; Expo Router warns about it while the sign-in group is the stack's first screen. */
LogBox.ignoreLogs([
  'uses presentation "formSheet" but is the first screen in its native stack',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

/** Last-resort screen for errors thrown while rendering any route (Expo Router wraps the layout with it). */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

/** A transparent sheet becomes Liquid Glass only on iOS 26+. Earlier iOS versions would show the screen behind through it. */
const SHEET_IS_GLASS = process.env.EXPO_OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;

/**
 * `verify` is the second authentication step: a sheet over the sign-in screen. It closes like any sheet: drag it down,
 * tap Cancel, or the Android back gesture; the screen clears the half-finished challenge whenever it is removed.
 * iOS 26+ draws a transparent sheet as Liquid Glass; every other platform/version gets the solid background.
 */
const VERIFY_SHEET_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetGrabberVisible: false,
  sheetCornerRadius: 28,
  sheetAllowedDetents: process.env.EXPO_OS === 'android' ? [0.72] : [0.7, 1],
  contentStyle: { backgroundColor: SHEET_IS_GLASS ? 'transparent' : colors.background },
};

/** "로그인이 안 되나요?": the same sheet, nearly full height (the answers are long). */
const HELP_SHEET_OPTIONS: NativeStackNavigationOptions = {
  ...VERIFY_SHEET_OPTIONS,
  sheetAllowedDetents: process.env.EXPO_OS === 'android' ? [1] : [0.92],
};

/** The sign-in notice: a bottom sheet over the tabs, as tall as its content (partial height on iOS and Android). */
const NOTICE_SHEET_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetGrabberVisible: false,
  sheetCornerRadius: 28,
  sheetAllowedDetents: 'fitToContents',
  contentStyle: { backgroundColor: colors.background },
};

function RootNavigator() {
  const isSignedIn = useIsSignedIn();
  const mustChangePassword = useMustChangePassword();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn && mustChangePassword}>
        <Stack.Screen name="password-change" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn && !mustChangePassword}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="feature/[id]" />
        <Stack.Screen name="notice-popup" options={NOTICE_SHEET_OPTIONS} />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify" options={VERIFY_SHEET_OPTIONS} />
        <Stack.Screen name="login-help" options={HELP_SHEET_OPTIONS} />
      </Stack.Protected>
      <Stack.Screen name="maintenance" options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="account-locked" options={{ presentation: 'modal', gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Nothing to hydrate (the session lives in memory and i18n is initialized synchronously): show the app right away.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
          <ToastHost />
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
