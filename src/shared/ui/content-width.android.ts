import { width } from '@expo/ui/jetpack-compose/modifiers';

import { CONTENT_MAX_WIDTH } from '@/shared/theme';

import type { ContentWidthModifiers } from './content-width.types';

/**
 * Compose 모디파이어에는 widthIn(max)이 노출돼 있지 않아 `width(CONTENT_MAX_WIDTH)`를 쓴다.
 * Compose `width`는 들어오는 제약 안으로 맞춰지므로(coerce) 부모가 좁으면(폰, 좁은 시트) 부모 폭이 되고, 넓으면 최대 폭이 된다.
 * 창 폭으로 계산하지 않는다: 폼 시트는 창보다 좁을 수 있다.
 */
const MODIFIERS = [width(CONTENT_MAX_WIDTH)];

export function useContentWidthModifiers(): ContentWidthModifiers {
  return MODIFIERS;
}
