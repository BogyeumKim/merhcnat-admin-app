import { z } from 'zod';

const schema = z.object({
  apiBaseUrl: z.url(),
  /** 개발 전용: 네트워크 대신 앱 내 mock에서 인증 응답을 제공한다. 릴리스 빌드에서는 무시된다. */
  apiMock: z.boolean(),
  /** 개발 전용: 로그인 안내 팝업을 fixture에서 제공한다. 릴리스 빌드에서는 무시된다. */
  noticeMock: z.boolean(),
  /** 필수 업데이트 화면용 App Store id(숫자). 앱 등록 전에는 없다. Android는 application id에서 스토어 링크를 만든다. */
  iosAppStoreId: z.string().regex(/^\d+$/).optional(),
});

/**
 * 시작 시 한 번 검증한다. Expo는 리터럴 참조만 인라인하므로 모든 변수를 정적으로 읽는다
 * (`process.env.EXPO_PUBLIC_X`). `process.env[name]`이나 구조 분해는 `undefined`가 된다.
 * `EXPO_PUBLIC_*` 값은 앱을 가진 누구나 읽을 수 있다: 비밀 값을 넣지 않는다.
 */
const parsed = schema.parse({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiMock: process.env.EXPO_PUBLIC_API_MOCK === '1',
  noticeMock: process.env.EXPO_PUBLIC_NOTICE_MOCK === '1',
  iosAppStoreId: process.env.EXPO_PUBLIC_IOS_APP_STORE_ID || undefined,
});

/**
 * 개발 전용: Android 에뮬레이터에서 `localhost`는 에뮬레이터 자신이며 호스트 머신은 `10.0.2.2`다.
 * iOS 시뮬레이터는 호스트 네트워크를 공유하므로 `localhost`가 동작한다. 실제 기기는 PC의 LAN IP를
 * `EXPO_PUBLIC_API_BASE_URL`에 적어야 한다(`localhost`가 아니므로 그대로 둔다).
 */
function resolveBaseUrl(url: string): string {
  if (!__DEV__ || process.env.EXPO_OS !== 'android') return url;
  const target = new URL(url);
  if (target.hostname !== 'localhost' && target.hostname !== '127.0.0.1') return url;
  target.hostname = '10.0.2.2';
  return target.toString().replace(/\/$/, '');
}

export const env = { ...parsed, apiBaseUrl: resolveBaseUrl(parsed.apiBaseUrl) };
