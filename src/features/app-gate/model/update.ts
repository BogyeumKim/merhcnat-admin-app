import * as Application from 'expo-application';
import { Linking } from 'react-native';
import { z } from 'zod';

import type { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

const version = z.string().regex(/^\d+(\.\d+){0,3}$/);

/** 필수 업데이트 화면의 라우트 대상. `UPDATE_REQUIRED` 오류로부터 만든다. 최신 버전은 선택 사항이다(서버가 보내지 않을 수 있음). */
export function updateRequiredHref(error: ApiError) {
  const latest = version.safeParse(error.extras.latestVersion);
  return { pathname: '/update-required' as const, params: latest.success ? { latest: latest.data } : {} };
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
