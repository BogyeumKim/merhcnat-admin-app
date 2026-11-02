import { defaultMinSize, semantics, weight } from '@expo/ui/jetpack-compose/modifiers';

import { FIELD_ROW_HEIGHT, NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

/** Weighted so the Compose text field takes the row width left over by `trailing`. */
const FILL_ROW = weight(1);
const MIN_ROW = [defaultMinSize({ minHeight: FIELD_ROW_HEIGHT })];

/** Underlined text field (Android). TalkBack reads the label through `contentDescription`. */
export function NativeField({ accessibilityLabel, ...props }: NativeFieldProps) {
  return (
    <NativeFieldBase
      {...props}
      rowModifiers={MIN_ROW}
      inputModifiers={accessibilityLabel ? [FILL_ROW, semantics({ contentDescription: accessibilityLabel })] : [FILL_ROW]}
    />
  );
}
