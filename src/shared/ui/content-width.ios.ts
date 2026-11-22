import { frame } from '@expo/ui/swift-ui/modifiers';

import { CONTENT_MAX_WIDTH } from '@/shared/theme';

import type { ContentWidthModifiers } from './content-width.types';

/** SwiftUI 유연 프레임: 부모가 좁으면 부모 폭, 넓으면 최대 폭까지만 차지한다(시트처럼 창보다 좁은 부모에서도 정확하다). */
const MODIFIERS = [frame({ maxWidth: CONTENT_MAX_WIDTH })];

export function useContentWidthModifiers(): ContentWidthModifiers {
  return MODIFIERS;
}
