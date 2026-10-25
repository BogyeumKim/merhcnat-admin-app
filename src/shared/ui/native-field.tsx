import { TextInput, type TextInputProps } from '@expo/ui';

import { radius, spacing, useNativeColors } from '@/shared/theme';

/**
 * Text field with the project look. No `fontSize` on purpose: the native default follows the system font size
 * (Dynamic Type on iOS, `sp` on Android). The field grows with it instead of clipping.
 * `invalid` marks an error state with a thicker danger border (not color alone).
 */
export function NativeField({ style, textStyle, invalid = false, ...props }: TextInputProps & { invalid?: boolean }) {
  const colors = useNativeColors();

  return (
    <TextInput
      placeholderTextColor={colors.secondaryText}
      cursorColor={colors.action}
      selectionColor={colors.action}
      textStyle={{ color: colors.text, ...textStyle }}
      style={{
        width: '100%',
        padding: spacing.md,
        backgroundColor: colors.field,
        borderRadius: radius.md,
        borderWidth: invalid ? 2 : 1,
        borderColor: invalid ? colors.danger : colors.fieldBorder,
        ...style,
      }}
      {...props}
    />
  );
}
