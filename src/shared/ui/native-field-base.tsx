import { Column, Row, TextInput } from '@expo/ui';
import { useState } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';

import { FieldUnderline } from './field-underline';
import type { NativeFieldProps } from './native-field.types';

type NativeFieldBaseProps = NativeFieldProps & {
  /** Platform modifiers for the input inside the row (Android needs `weight(1)` to fill the row). */
  inputModifiers?: NativeFieldProps['modifiers'];
  /** Platform modifiers for the row: a minimum height so every field row is the same height (see `FIELD_ROW_HEIGHT`). */
  rowModifiers?: NativeFieldProps['modifiers'];
};

/** Minimum row height in dp: the 44 touch target. The text field and the secure field differ slightly in height, and so do the icons. */
export const FIELD_ROW_HEIGHT = 44;

/**
 * Underlined field (no box). The row holds the input and the optional `trailing` control; the line under it shows the
 * state. No `fontSize` on purpose: the field follows the system text size (Dynamic Type / `sp`) and grows with it
 * instead of clipping. State kept here is only the focus boolean, never the text.
 */
export function NativeFieldBase({
  style,
  textStyle,
  invalid = false,
  trailing,
  onFocus,
  onBlur,
  inputModifiers,
  rowModifiers,
  ...props
}: NativeFieldBaseProps) {
  const colors = useNativeColors();
  const [focused, setFocused] = useState(false);

  return (
    <Column style={{ width: '100%' }}>
      <Row alignment="center" spacing={spacing.sm} modifiers={rowModifiers} style={{ width: '100%' }}>
        <TextInput
          placeholderTextColor={colors.secondaryText}
          cursorColor={colors.action}
          selectionColor={colors.action}
          textStyle={{ color: colors.text, ...textStyle }}
          style={{ paddingVertical: spacing.sm, ...style }}
          modifiers={inputModifiers}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          {...props}
        />
        {trailing}
      </Row>
      <FieldUnderline invalid={invalid} focused={focused} />
    </Column>
  );
}
