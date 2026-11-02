import type { useNativeColors } from '@/shared/theme';

import type { NativeTextTone } from './native-text.types';

type Colors = ReturnType<typeof useNativeColors>;

/** Text color per tone. `onAction` is the label color on an `action` (red) fill, contrast 4.94 in light mode (`colors.ts`). */
export const TONE_COLOR: Record<NativeTextTone, (colors: Colors) => string> = {
  default: (colors) => colors.text,
  secondary: (colors) => colors.secondaryText,
  danger: (colors) => colors.danger,
  onAction: (colors) => colors.onAction,
};
