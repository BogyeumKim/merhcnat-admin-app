import '@/shared/i18n';

import type { ErrorBoundaryProps } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryProvider } from '@/core/providers/query-provider';
import { ErrorScreen } from '@/shared/ui/error-screen';
import { ToastHost } from '@/shared/ui/toast-host';

SplashScreen.preventAutoHideAsync();

/** Last-resort screen for errors thrown while rendering any route (Expo Router wraps the layout with it). */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Nothing to hydrate (i18n is initialized synchronously): show the app right away.
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
