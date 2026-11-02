import { z } from 'zod';

const schema = z.object({
  apiBaseUrl: z.url(),
  /** Dev only: serve auth responses from the in-app mock instead of the network. Ignored in release builds. */
  apiMock: z.boolean(),
  /** Dev only: serve the sign-in notice popups from fixtures. Ignored in release builds. */
  noticeMock: z.boolean(),
});

/**
 * Validated once at startup. Every variable is read statically (`process.env.EXPO_PUBLIC_X`) because Expo only
 * inlines literal references; `process.env[name]` or destructuring would be `undefined`.
 * `EXPO_PUBLIC_*` values are readable by anyone with the app: never put secrets here.
 */
const parsed = schema.parse({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiMock: process.env.EXPO_PUBLIC_API_MOCK === '1',
  noticeMock: process.env.EXPO_PUBLIC_NOTICE_MOCK === '1',
});

/**
 * Development only: on the Android emulator `localhost` is the emulator itself, and the host machine is `10.0.2.2`.
 * The iOS simulator shares the host's network, so `localhost` works there. A physical device needs the PC's LAN IP
 * written into `EXPO_PUBLIC_API_BASE_URL` (it is not `localhost`, so it is left alone).
 */
function resolveBaseUrl(url: string): string {
  if (!__DEV__ || process.env.EXPO_OS !== 'android') return url;
  const target = new URL(url);
  if (target.hostname !== 'localhost' && target.hostname !== '127.0.0.1') return url;
  target.hostname = '10.0.2.2';
  return target.toString().replace(/\/$/, '');
}

export const env = { ...parsed, apiBaseUrl: resolveBaseUrl(parsed.apiBaseUrl) };
