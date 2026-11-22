import { defaultMinSize, semantics, weight } from '@expo/ui/jetpack-compose/modifiers';

import { NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

/** Compose 텍스트 필드가 `trailing`을 뺀 나머지 행 너비를 차지하도록 weight를 준다. */
const FILL_ROW = weight(1);
/** 53 + 링 1.5 x 2 = 디자인 박스 높이 56. */
const MIN_ROW = [defaultMinSize({ minHeight: 53 })];

/** 박스형 텍스트 필드 (Android). TalkBack은 `contentDescription`으로 라벨을 읽는다. */
export function NativeField({ accessibilityLabel, ...props }: NativeFieldProps) {
  return (
    <NativeFieldBase
      {...props}
      rowModifiers={MIN_ROW}
      inputModifiers={accessibilityLabel ? [FILL_ROW, semantics({ contentDescription: accessibilityLabel })] : [FILL_ROW]}
    />
  );
}
