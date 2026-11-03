import { Text } from '@expo/ui';

import { useNativeColors } from '@/shared/theme';

import { TONE_COLOR } from './native-text-tone';
import type { NativeTextProps } from './native-text.types';

/** Android (default) sizes. Compose converts `fontSize` to `sp`, so it follows the system font size. */
const sizes = {
  largeTitle: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700' },
  headline: { fontSize: 17, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;

/**
 * Text drawn inside an `@expo/ui` tree (`Host`). Platform files differ on purpose: on iOS an explicit
 * `fontSize` is a *fixed* size (no Dynamic Type), so `native-text.ios.tsx` uses SwiftUI text styles.
 */
export function NativeText({ children, variant = 'body', tone = 'default', center }: NativeTextProps) {
  const colors = useNativeColors();
  const color = TONE_COLOR[tone](colors);

  return <Text textStyle={{ ...sizes[variant], color, textAlign: center ? 'center' : 'left' }}>{children}</Text>;
}
