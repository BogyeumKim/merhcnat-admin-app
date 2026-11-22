import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** `checking`은 첫 읽기 전, `unavailable`은 `expo-notifications`가 없는 빌드(영원히 확인 중으로 보이지 않게 구분한다). */
type PushPermission = 'checking' | 'granted' | 'denied' | 'unavailable';

/** `expo-notifications`는 선택 사항이다(`device-push.ts` 참고). 없는 빌드는 `unavailable`을 반환한다. */
async function readPermission(): Promise<PushPermission> {
  try {
    const Notifications = await import('expo-notifications');
    return (await Notifications.getPermissionsAsync()).granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/** OS 알림 권한. 앱이 포그라운드로 돌아올 때마다 다시 읽는다(사용자가 시스템 설정에서 바꿨을 수 있음). */
export function usePushPermission(): PushPermission {
  const [status, setStatus] = useState<PushPermission>('checking');

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void readPermission().then((next) => {
        if (active) setStatus(next);
      });
    };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return status;
}
