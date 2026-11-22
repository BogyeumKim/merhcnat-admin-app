import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android 뒤로가기로 이 화면을 빠져나가지 못하게 한다. 이동할 곳이 없는 전체 화면(점검, 필수 업데이트 등)에서 쓴다.
 * `enabled`가 false면 아무것도 하지 않는다. `mode`: `'ignore'`(기본)는 무시, `'exit'`는 앱을 끝낸다
 * (스펙 1-10~1-14 차단 화면: 뒤로가기 = 앱 종료).
 */
export function useBlockBackButton(enabled = true, mode: 'ignore' | 'exit' = 'ignore') {
  useEffect(() => {
    if (!enabled) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'exit') BackHandler.exitApp();
      return true;
    });
    return () => subscription.remove();
  }, [enabled, mode]);
}
