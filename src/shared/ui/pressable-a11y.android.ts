import { semantics } from '@expo/ui/jetpack-compose/modifiers';

import type { PressableA11yModifiers } from './pressable-a11y';

/**
 * Android: universal `onPress`는 Compose `clickable`이라 이미 자식 문구를 합쳐 한 번에 읽고 "두 번 탭하여 활성화"를 안내한다.
 * 이름이 따로 필요할 때만 `contentDescription`을 준다.
 */
export function pressableA11y(label?: string): PressableA11yModifiers {
  return label ? [semantics({ contentDescription: label })] : undefined;
}
