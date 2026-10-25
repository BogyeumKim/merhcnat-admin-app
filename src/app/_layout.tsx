import '@/shared/i18n';

import type { ErrorBoundaryProps, NativeStackNavigationOptions } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryProvider } from '@/core/providers/query-provider';
import { useIsSignedIn } from '@/features/auth';
import { colors } from '@/shared/theme';
import { ErrorScreen } from '@/shared/ui/error-screen';
import { ToastHost } from '@/shared/ui/toast-host';

SplashScreen.preventAutoHideAsync();

/** Last-resort screen for errors thrown while rendering any route (Expo Router wraps the layout with it). */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

/**
 * `verify` is the second authentication step: a sheet over the sign-in screen. Swiping it away is off so a
 * half-finished challenge is only left through Cancel. iOS 26 draws a transparent sheet as Liquid Glass; Android
 * has no glass, so it gets the solid background.
 */
const VERIFY_SHEET_OPTIONS: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.7, 1],
  gestureEnabled: false,
  contentStyle: { backgroundColor: process.env.EXPO_OS === 'ios' ? 'transparent' : colors.background },
};

function RootNavigator() {
  const isSignedIn = useIsSignedIn();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify" options={VERIFY_SHEET_OPTIONS} />
      </Stack.Protected>
      <Stack.Screen name="maintenance" options={{ presentation: 'modal' }} />
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
