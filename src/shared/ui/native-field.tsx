import { NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

/** Underlined text field, platform-neutral fallback (iOS and Android have their own files). */
export function NativeField({ accessibilityLabel: _label, ...props }: NativeFieldProps) {
  return <NativeFieldBase {...props} />;
}
