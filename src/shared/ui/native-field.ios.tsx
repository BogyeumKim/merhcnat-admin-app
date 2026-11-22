import { accessibilityLabel as accessibilityLabelModifier, background, frame, shapes, strokeBorder } from '@expo/ui/swift-ui/modifiers';

import { radius } from '@/shared/theme';

import { NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

const MIN_ROW = [frame({ minHeight: 56 })];
/** 배경은 최소 높이 frame 뒤에 적용하는 modifier라 56pt 박스 전체를 덮는다. 1.5pt 링은 박스의 둥근 모서리를 따른다 (`strokeBorder`; `borderWidth` + `borderRadius`는 잘린다). */
const ring = (color: string, fill: string) => [
  background(fill, shapes.roundedRectangle({ cornerRadius: radius.lg })),
  strokeBorder({ color, shape: 'roundedRectangle', cornerRadius: radius.lg, style: { lineWidth: 1.5 } }),
];

/** 박스형 텍스트 필드 (iOS). SwiftUI `TextField`가 행을 스스로 채우며, VoiceOver가 라벨을 읽는다. */
export function NativeField({ accessibilityLabel, ...props }: NativeFieldProps) {
  return (
    <NativeFieldBase
      {...props}
      rowModifiers={MIN_ROW}
      ringModifiers={ring}
      inputModifiers={accessibilityLabel ? [accessibilityLabelModifier(accessibilityLabel)] : undefined}
    />
  );
}
