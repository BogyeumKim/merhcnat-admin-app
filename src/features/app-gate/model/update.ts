import * as Application from 'expo-application';
import { Linking } from 'react-native';

import { env } from '@/shared/config/env';

/** 점 구분 숫자 버전을 비교한다("1.10.0" > "1.9.0"). 빠진 자리는 0. 숫자가 아닌 자리는 0으로 본다. */
export function compareVersions(a: string, b: string): number {
  const left = a.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split('.').map((part) => Number.parseInt(part, 10) || 0);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** 이 앱의 스토어 페이지. 알 수 없으면 `null`(앱 등록 전에는 iOS App Store id가 없음). */
function storeUrl(): string | null {
  if (process.env.EXPO_OS === 'android') return Application.applicationId ? `market://details?id=${Application.applicationId}` : null;
  return env.iosAppStoreId ? `itms-apps://apps.apple.com/app/id${env.iosAppStoreId}` : null;
}

/** 스토어 페이지를 연다. 열 페이지가 없거나 스토어 앱을 열지 못하면 `false`를 반환한다. */
export async function openStore(): Promise<boolean> {
  const url = storeUrl();
  if (!url) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
