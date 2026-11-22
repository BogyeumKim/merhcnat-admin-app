import type { Column } from '@expo/ui';
import type { ComponentProps } from 'react';

export type PressableA11yModifiers = ComponentProps<typeof Column>['modifiers'];

/**
 * 눌리는 `@expo/ui` `Row`/`Column`(카드, 목록 행)을 스크린 리더에 버튼 하나로 노출하는 modifier.
 * `<Row onPress={...} modifiers={pressableA11y(label)}>`처럼 쓰고, 다른 modifier가 있으면 펼쳐 합친다.
 * `label`을 주면 안쪽 문구 대신 그 이름을 읽는다(생략하면 안쪽 문구를 합쳐 읽는다).
 * 이 기본 파일은 플랫폼 중립 폴백이다(iOS/Android는 각자 파일이 쓰인다).
 */
export function pressableA11y(_label?: string): PressableA11yModifiers {
  return undefined;
}
