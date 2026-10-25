import { z } from 'zod';

const schema = z.object({
  apiBaseUrl: z.url(),
  /** Dev only: serve auth responses from the in-app mock instead of the network. Ignored in release builds. */
  apiMock: z.boolean(),
});

/**
 * Validated once at startup. Every variable is read statically (`process.env.EXPO_PUBLIC_X`) because Expo only
 * inlines literal references; `process.env[name]` or destructuring would be `undefined`.
 * `EXPO_PUBLIC_*` values are readable by anyone with the app: never put secrets here.
 */
export const env = schema.parse({
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  apiMock: process.env.EXPO_PUBLIC_API_MOCK === '1',
});
