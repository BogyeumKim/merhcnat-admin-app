import { accessibilityLabel as accessibilityLabelModifier, background, frame, shapes, strokeBorder } from '@expo/ui/swift-ui/modifiers';

import { radius } from '@/shared/theme';

import { NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

const MIN_ROW = [frame({ minHeight: 56 })];
/** The fill is a modifier applied after the minimum-height frame, so it covers the whole 56pt box. The 1.5pt ring follows the box's rounded corners (`strokeBorder`; `borderWidth` + `borderRadius` would clip it). */
const ring = (color: string, fill: string) => [
  background(fill, shapes.roundedRectangle({ cornerRadius: radius.lg })),
  strokeBorder({ color, shape: 'roundedRectangle', cornerRadius: radius.lg, style: { lineWidth: 1.5 } }),
];

/** Underlined text field (iOS). The SwiftUI `TextField` fills the row by itself; VoiceOver reads the label. */
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
