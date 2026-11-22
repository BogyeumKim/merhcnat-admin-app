import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

/** SecureStore 키. 설치 확인 전에 다른 모듈이 직접 읽지 않도록 이 파일에서만 정의한다. */
export const DEVICE_SECURE_KEYS = {
  id: 'device.id',
  secret: 'device.secret',
} as const;

/** 삭제된 "아이디 저장" 기능이 남겼을 수 있는 값. 재설치 때 함께 지운다. */
const LEGACY_SECURE_KEYS = ['login.savedUserId'] as const;

let freshInstallPromise: Promise<void> | null = null;

async function wipeIfFreshInstall(): Promise<void> {
  if (storage.getString(STORAGE_KEYS.installMarker)) return;

  const keys = [DEVICE_SECURE_KEYS.id, DEVICE_SECURE_KEYS.secret, ...LEGACY_SECURE_KEYS];
  const results = await Promise.allSettled(keys.map((key) => SecureStore.deleteItemAsync(key)));
  // 하나라도 지우지 못했으면 표식을 남기지 않아 다음 접근에서 다시 지운다.
  if (results.some((result) => result.status === 'rejected')) throw new Error('fresh install wipe failed');

  storage.setString(STORAGE_KEYS.installMarker, '1');
}

/**
 * 설치 후 첫 실행이면 이전 설치의 기기 값을 지운다.
 * iOS Keychain 항목은 앱을 삭제해도 남아, 재설치한 앱이 등록 기기로 인정돼 OTP를 건너뛴다.
 * 결제 앱이므로 재설치는 새 기기로 본다(Android는 삭제 때 이미 지워지므로 무해하다).
 * 표식은 앱 삭제 때 함께 지워지는 kv-store에 둔다. 동시 호출자는 하나의 promise를 공유하고,
 * 실패는 캐시하지 않으며 로그인을 막지 않는다: 남은 값이 쓰여도 최악은 서버가 OTP를 묻는 것이다.
 */
export function ensureFreshInstallHandled(): Promise<void> {
  freshInstallPromise ??= wipeIfFreshInstall().catch(() => {
    freshInstallPromise = null;
  });
  return freshInstallPromise;
}
