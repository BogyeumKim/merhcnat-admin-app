import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export type PushPermission = 'granted' | 'denied' | 'unknown';

/** `expo-notifications` is optional (see `device-push.ts`): a build without it reports `unknown`. */
async function readPermission(): Promise<PushPermission> {
  try {
    const Notifications = await import('expo-notifications');
    return (await Notifications.getPermissionsAsync()).granted ? 'granted' : 'denied';
  } catch {
    return 'unknown';
  }
}

/** The OS notification permission. It is re-read whenever the app returns to the foreground (the user may have changed it in system settings). */
export function usePushPermission(): PushPermission {
  const [status, setStatus] = useState<PushPermission>('unknown');

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
