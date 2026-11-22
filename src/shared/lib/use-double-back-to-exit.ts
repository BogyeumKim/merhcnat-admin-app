import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

import { translate } from '@/shared/i18n';
import { dismissToast, showInfoToast } from '@/shared/ui/toast';

/** 두 번째 뒤로가기를 종료로 보는 시간. 안내 토스트도 이 시간만큼 보인다. */
const EXIT_WINDOW_MS = 2000;
const TOAST_ID = 'info:back-to-exit';

/**
 * Android 뒤로가기 두 번 종료(로그인 화면): 처음 누르면 "한 번 더 누르면 종료돼요" 토스트, 2초 안에 다시 누르면 앱을 끝낸다.
 * 화면이 포커스된 동안만 듣는다: 위에 시트나 다른 화면이 있으면 그 화면의 뒤로가기(닫기)를 가로채지 않는다. iOS는 아무것도 하지 않는다.
 * `enabled`가 false면 듣지 않는다: 같은 화면이 차단 안내(뒤로가기 = 바로 종료)를 그리는 동안 그 동작을 가로채지 않게 한다.
 */
export function useDoubleBackToExit(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled || process.env.EXPO_OS !== 'android') return undefined;
      let lastPress = 0;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        const now = Date.now();
        if (now - lastPress < EXIT_WINDOW_MS) {
          dismissToast(TOAST_ID);
          BackHandler.exitApp();
          return true;
        }
        lastPress = now;
        showInfoToast({ id: TOAST_ID, title: translate('common.pressBackAgainToExit'), durationMs: EXIT_WINDOW_MS });
        return true;
      });
      return () => subscription.remove();
    }, [enabled]),
  );
}
