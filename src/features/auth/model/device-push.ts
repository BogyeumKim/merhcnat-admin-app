import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import type * as NotificationsModule from 'expo-notifications';

import { env } from '@/shared/config/env';

import { updateDevice } from '../api/device-api';

type Notifications = typeof NotificationsModule;

/**
 * `expo-notifications`는 네이티브 모듈이다. 지연·선택적으로 로드한다: 모듈이 추가되기 전에 만든 빌드(또는
 * 로드할 수 없는 빌드)는 import 시점에 크래시하지 않고 푸시 등록을 건너뛴다.
 */
async function loadNotifications(): Promise<Notifications | null> {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

/**
 * Expo 푸시 토큰, 발급할 수 없으면 `undefined`. 발급에는 앱 설정의 EAS 프로젝트 id(`eas init`),
 * Android의 Firebase(`google-services.json`), iOS의 Apple 푸시 자격 증명이 필요하며, 없으면
 * 알림 권한은 그대로 보고하고 토큰만 생략한다.
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
 * 실제 푸시 자격 증명이 생기기 전까지의 대역: 서버는 `ExponentPushToken[` 접두사만 확인하고 값이
 * 기기별로 유일하도록 유지하므로(중복 값은 가장 최근 소유자로 이동) 등록마다 새 랜덤 값을 보낸다.
 * `issuePushToken`이 실제 토큰을 반환할 수 있게 되면 아래 `?? placeholder`와 함께 제거한다.
 */
function placeholderPushToken(): string {
  return `ExponentPushToken[${randomUUID().replaceAll('-', '').slice(0, 22)}]`;
}

/**
 * 로그인 완료 후: 알림 권한을 요청하고(OS는 선택이 남아 있을 때만 프롬프트를 띄우므로 이후엔 no-op),
 * 서버에 이 기기의 푸시 토큰을 알린다(서버는 토큰 존재 여부로 "알림 허용"을 판단). 다른 계정이 기기를 넘겨받으면
 * 서버가 푸시 값을 비우므로, 새 기기의 첫 로그인뿐 아니라 로그인할 때마다 실행한다.
 * 최선 노력 방식: 로그인을 막거나 실패시키지 않는다.
 */
export async function registerDevicePush(): Promise<void> {
  // 앱 내 mock 서버(개발 전용)에는 푸시 서비스가 없고, OS 권한 프롬프트가 화면을 가린다.
  if (__DEV__ && env.apiMock) return;
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return;

    // Android 13+는 알림 채널이 있어야 권한 프롬프트를 띄운다.
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
    // 푸시 등록 때문에 로그인을 방해할 필요는 없다. 다음 로그인에서 다시 시도한다.
  }
}
