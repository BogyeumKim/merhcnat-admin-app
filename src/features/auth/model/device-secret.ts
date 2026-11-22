import * as SecureStore from 'expo-secure-store';

import { DEVICE_SECURE_KEYS, ensureFreshInstallHandled } from './fresh-install';

/**
 * 기기 비밀키: 서버가 OTP 검증·임시비밀번호 변경으로 이 기기를 등록할 때 **한 번만** 내려준다.
 * 다음 로그인과 푸시 갱신에 `deviceId`와 함께 보내야 등록 기기로 인정된다(OTP 생략).
 * 로그인 토큰과 달리 다음 실행에도 필요한 비밀이므로 Keychain/Keystore(`expo-secure-store`)에 둔다.
 * THIS_DEVICE_ONLY: 백업으로 다른 휴대폰에 복원되면 안 된다. 값은 로그·화면·쿼리 캐시 어디에도 남기지 않는다.
 * 읽기 실패는 "없음"으로 처리한다: 서버가 OTP 단계로 보내므로 안전하다.
 * 재설치 직후에는 이전 설치의 값을 먼저 지운다(`fresh-install`).
 */
export async function loadDeviceSecret(): Promise<string | undefined> {
  await ensureFreshInstallHandled();
  try {
    return (await SecureStore.getItemAsync(DEVICE_SECURE_KEYS.secret)) ?? undefined;
  } catch {
    return undefined;
  }
}

/** 새 비밀키로 교체한다(기기 재등록·다른 계정이 이 기기를 넘겨받은 경우 이전 값은 서버에서 무효). */
export async function saveDeviceSecret(secret: string): Promise<void> {
  // 저장 뒤에 첫 실행 정리가 돌아 새 값을 지우지 않도록 먼저 끝낸다.
  await ensureFreshInstallHandled();
  try {
    await SecureStore.setItemAsync(DEVICE_SECURE_KEYS.secret, secret, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch {
    // 저장 실패: 다음 로그인에서 OTP를 한 번 더 거칠 뿐이다.
  }
}
