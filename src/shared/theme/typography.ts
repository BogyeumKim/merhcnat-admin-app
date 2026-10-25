import type { TextStyle } from 'react-native';

/**
 * Named text styles for React Native `Text`. No `lineHeight`: RN scales font sizes with the system text
 * size, and a fixed line height would clip the glyphs at large sizes.
 */
export const type = {
  largeTitle: { fontSize: 32, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700' },
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
