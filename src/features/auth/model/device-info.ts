import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'device.id';

export type DeviceInfo = {
  /** Install-scoped random UUID. Survives app updates; may or may not survive a reinstall (iOS Keychain only). */
  deviceId: string;
  /** Android only. The server stores a keyed hash, never the raw value. */
  androidId?: string;
  platform: 'IOS' | 'ANDROID';
  osVersion?: string;
  deviceModel?: string;
  appVersion?: string;
};

let deviceIdPromise: Promise<string> | null = null;

async function loadOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const created = Crypto.randomUUID();
  // THIS_DEVICE_ONLY: a backup restored on another phone must not carry this identity along.
  await SecureStore.setItemAsync(DEVICE_ID_KEY, created, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return created;
}

/**
 * One shared promise so two concurrent callers can never create two different ids. A failed attempt is not cached
 * (otherwise one transient keychain error would break every login until the app restarts), and a failed *read* never
 * falls through to creating a new id: only a missing entry does.
 */
function getDeviceId() {
  deviceIdPromise ??= loadOrCreateDeviceId().catch((error: unknown) => {
    deviceIdPromise = null;
    throw error;
  });
  return deviceIdPromise;
}

/** Device signals sent with the login request. Never log or persist these anywhere else. */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const isAndroid = process.env.EXPO_OS === 'android';

  return {
    deviceId: await getDeviceId(),
    androidId: isAndroid ? Application.getAndroidId() : undefined,
    platform: isAndroid ? 'ANDROID' : 'IOS',
    osVersion: Device.osVersion ?? undefined,
    deviceModel: Device.modelName ?? undefined,
    appVersion: Application.nativeApplicationVersion ?? undefined,
  };
}
