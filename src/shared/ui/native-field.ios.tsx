import { accessibilityLabel as accessibilityLabelModifier, frame } from '@expo/ui/swift-ui/modifiers';

import { FIELD_ROW_HEIGHT, NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

const MIN_ROW = [frame({ minHeight: FIELD_ROW_HEIGHT })];

/** Underlined text field (iOS). The SwiftUI `TextField` fills the row by itself; VoiceOver reads the label. */
export function NativeField({ accessibilityLabel, ...props }: NativeFieldProps) {
  return (
    <NativeFieldBase
      {...props}
      rowModifiers={MIN_ROW}
      inputModifiers={accessibilityLabel ? [accessibilityLabelModifier(accessibilityLabel)] : undefined}
    />
  );
}
