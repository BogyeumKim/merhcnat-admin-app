import { semantics } from '@expo/ui/jetpack-compose/modifiers';

import type { PressableA11yModifiers } from './pressable-a11y';

/**
 * Android: universal `onPress`는 Compose `clickable`이라 이미 자식 문구를 합쳐 한 번에 읽고 "두 번 탭하여 활성화"를 안내한다.
 * 이름이 따로 필요할 때만 `contentDescription`을 준다.
 * 58.0.29 `semantics`는 `contentDescription`/`contentType`만 노출한다(`stateDescription` 없음). 그래서 `value`는 이름 뒤에 붙여
 * "제목, 펼쳐짐"으로 읽힌다. `contentDescription`이 안쪽 문구를 대신하므로 `value`를 쓰려면 `label`도 줘야 한다.
 */
export function pressableA11y(label?: string, value?: string): PressableA11yModifiers {
  if (!label) return undefined;
  return [semantics({ contentDescription: value ? `${label}, ${value}` : label })];
}
