import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import type { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useNativeColors } from '@/shared/theme';
import { ToastHost } from '@/shared/ui/toast-host';

import { AlertModalHost } from './alert-modal-host';
import { QueryProvider } from './query-provider';

/**
 * 앱 전체 provider 묶음과 전역 호스트(토스트, 알림 다이얼로그). 루트 레이아웃이 한 번만 감싼다.
 * 호스트는 내비게이터 뒤에 두어 모든 화면 위에 그린다.
 */
export function AppProviders({ children }: PropsWithChildren) {
  const { scheme, background } = useNativeColors();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  // 화면 전환 중 비치는 내비게이션 배경을 팔레트 `background`와 맞춘다(기본 테마의 회색 #F2F2F2/검정이 전환 때 번쩍이지 않게).
  const navigationTheme = { ...base, colors: { ...base.colors, background } };

  return (
    <GestureHandlerRootView style={ROOT}>
      <QueryProvider>
        <ThemeProvider value={navigationTheme}>
          {children}
          <ToastHost />
          <AlertModalHost />
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

const ROOT = { flex: 1 } as const;
