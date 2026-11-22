import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

import { loadDeviceSecret } from './device-secret';
import { DEVICE_SECURE_KEYS, ensureFreshInstallHandled } from './fresh-install';

export type DeviceInfo = {
  /** 설치 단위 랜덤 UUID. 앱 업데이트 후에도 유지되고, 재설치하면 새로 만든다(`fresh-install`). */
  deviceId: string;
  platform: 'IOS' | 'ANDROID';
  osVersion?: string;
  deviceModel?: string;
  appVersion?: string;
  /** 서버가 등록 때 준 기기 비밀키(`device-secret`). 없으면 보내지 않으며 서버가 OTP 단계로 보낸다. */
  deviceSecret?: string;
};

let deviceIdPromise: Promise<string> | null = null;

async function loadOrCreateDeviceId(): Promise<string> {
  // 재설치 직후 iOS Keychain에 남은 이전 설치의 id를 먼저 지운다.
  await ensureFreshInstallHandled();
  const existing = await SecureStore.getItemAsync(DEVICE_SECURE_KEYS.id);
  if (existing) return existing;

  const created = Crypto.randomUUID();
  // THIS_DEVICE_ONLY: 다른 휴대폰에 복원된 백업이 이 신원을 가져가면 안 된다.
  await SecureStore.setItemAsync(DEVICE_SECURE_KEYS.id, created, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return created;
}

/**
 * 하나의 promise를 공유해 동시 호출자가 서로 다른 id를 만들지 못하게 한다. 실패한 시도는 캐시하지 않으며
 * (일시적인 keychain 오류 한 번이 앱 재시작 전까지 모든 로그인을 막지 않도록), 읽기 실패는 새 id 생성으로
 * 넘어가지 않는다: 항목이 없을 때만 생성한다.
 */
function getDeviceId() {
  deviceIdPromise ??= loadOrCreateDeviceId().catch((error: unknown) => {
    deviceIdPromise = null;
    throw error;
  });
  return deviceIdPromise;
}

/** 로그인 요청과 함께 보내는 기기 신호. 다른 곳에 로깅하거나 저장하지 않는다. */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const isAndroid = process.env.EXPO_OS === 'android';

  return {
    deviceId: await getDeviceId(),
    platform: isAndroid ? 'ANDROID' : 'IOS',
    osVersion: Device.osVersion ?? undefined,
    deviceModel: Device.modelName ?? undefined,
    appVersion: Application.nativeApplicationVersion ?? undefined,
    deviceSecret: await loadDeviceSecret(),
  };
}
