import type { useNativeColors } from '@/shared/theme';

import type { NativeTextTone } from './native-text.types';

type Colors = ReturnType<typeof useNativeColors>;

/** tone별 글자 색. `onAction`은 `action`(빨강) 배경 위 라벨 색으로, 라이트 모드 대비 4.94 (`colors.ts`). */
export const TONE_COLOR: Record<NativeTextTone, (colors: Colors) => string> = {
  default: (colors) => colors.text,
  secondary: (colors) => colors.secondaryText,
  danger: (colors) => colors.danger,
  onAction: (colors) => colors.onAction,
  action: (colors) => colors.actionText,
  /** 충족·일치 확인(비밀번호 규칙 ✓, "비밀번호가 일치해요"). */
  success: (colors) => colors.success,
};
