import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import type * as NotificationsModule from 'expo-notifications';

import { updateDevice } from '../api/device-api';

type Notifications = typeof NotificationsModule;

/**
 * `expo-notifications` is a native module. It is loaded lazily and optionally: a build made before it was added (or one
 * that cannot load it) skips push registration instead of crashing at import time.
 */
async function loadNotifications(): Promise<Notifications | null> {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

/**
 * The Expo push token, or `undefined` when none can be issued. Issuing one needs the EAS project id in the app config
 * (`eas init`), Firebase on Android (`google-services.json`), and Apple push credentials on iOS; without them the
 * notification permission is still reported and the token is simply left out.
 */
async function issuePushToken(Notifications: Notifications): Promise<string | undefined> {
  const projectId: unknown = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (typeof projectId !== 'string' || projectId.length === 0) return undefined;
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return undefined;
  }
}

/**
 * Stand-in until real push credentials exist: the server only checks the `ExponentPushToken[` prefix and keeps the value
 * unique per device (a repeated value moves to its newest owner), so each registration sends a fresh random one.
 * Remove together with the `?? placeholder` below once `issuePushToken` can return a real token.
 */
function placeholderPushToken(): string {
  return `ExponentPushToken[${randomUUID().replaceAll('-', '').slice(0, 22)}]`;
}

/**
 * After a sign-in completes: ask for the notification permission (the OS shows its prompt only while the choice is still
 * open, so this is a no-op afterwards) and tell the server this device's push token (the server derives "notifications allowed" from the token being present). The server clears a device's push
 * values when another account takes it over, so this runs after every sign-in, not only the first one on a new device.
 * Best effort: it never blocks or fails the sign-in.
 */
export async function registerDevicePush(): Promise<void> {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return;

    // Android 13+ only shows the permission prompt once a notification channel exists.
    if (process.env.EXPO_OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Notifications.requestPermissionsAsync();
    }

    if (!permission.granted) return;
    await updateDevice({ expoPushToken: (await issuePushToken(Notifications)) ?? placeholderPushToken() });
  } catch {
    // Push registration is not worth interrupting a sign-in for; the next sign-in tries again.
  }
}
