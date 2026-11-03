import { Column, Row, TextInput } from '@expo/ui';
import { useState } from 'react';

import { radius, spacing, useNativeColors } from '@/shared/theme';

import type { NativeFieldProps } from './native-field.types';

type NativeFieldBaseProps = NativeFieldProps & {
  /** Platform modifiers for the input inside the row (Android needs `weight(1)` to fill the row). */
  inputModifiers?: NativeFieldProps['modifiers'];
  /** Platform modifiers for the box row: a minimum height so every field is the same height. */
  rowModifiers?: NativeFieldProps['modifiers'];
  /**
   * iOS draws the ring itself, with `strokeBorder` on the box (a wrapping ring `Column` would show through the
   * minimum-height frame as a thick band). Return the modifiers for the current ring color.
   */
  ringModifiers?: (ringColor: string, fillColor: string) => NativeFieldProps['modifiers'];
};

/** The box is 56 tall in the Korpay design (the platform files set the minimum height); the ring is 1.5. */
const RING = 1.5;
const RADIUS = radius.lg;

/**
 * Boxed field, the Korpay design: a tinted rounded box at rest; white with a 1.5 ink ring while focused; white with a
 * danger ring when invalid (not color alone: the message under it carries an icon). The ring is a rounded `Column` in the
 * ring color with the box inside it, so it follows the corners on both platforms (the `borderWidth` + `borderRadius`
 * pair clips the border on iOS). No `fontSize`: the text follows the system text size. State kept here is only the focus
 * boolean, never the text.
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
  ringModifiers,
  ...props
}: NativeFieldBaseProps) {
  const colors = useNativeColors();
  const [focused, setFocused] = useState(false);
  const ring = invalid ? colors.danger : focused ? colors.text : colors.canvas;

  const fill = focused || invalid ? colors.card : colors.canvas;

  const box = (
    <Row
      alignment="center"
      spacing={spacing.sm}
      modifiers={ringModifiers ? [...(rowModifiers ?? []), ...(ringModifiers(ring, fill) ?? [])] : rowModifiers}
      style={{
        width: '100%',
        ...(ringModifiers ? {} : { borderRadius: RADIUS - RING, backgroundColor: fill }),
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
      }}>
      <TextInput
        placeholderTextColor={colors.secondaryText}
        cursorColor={colors.action}
        selectionColor={colors.action}
        textStyle={{ color: colors.text, ...textStyle }}
        style={style}
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
  );

  return ringModifiers ? (
    box
  ) : (
    <Column style={{ width: '100%', padding: RING, borderRadius: RADIUS, backgroundColor: ring }}>{box}</Column>
  );
}
