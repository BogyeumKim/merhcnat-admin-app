import { Column, type TextInputProps } from '@expo/ui';

import { spacing } from '@/shared/theme';

import { NativeField } from './native-field';
import { NativeText } from './native-text';

type LabeledFieldProps = TextInputProps & {
  label: string;
  /** Translated field-level error, shown directly under the field. */
  error?: string | null;
};

/**
 * A field with a visible, persistent label and an inline error slot. A placeholder alone disappears while typing and
 * gives Android's screen reader nothing to announce; the placeholder repeats the label so SwiftUI also exposes it.
 */
export function LabeledField({ label, error, ...props }: LabeledFieldProps) {
  return (
    <Column spacing={spacing.xs} style={{ width: '100%' }}>
      <NativeText variant="subhead" tone="secondary">
        {label}
      </NativeText>
      <NativeField placeholder={label} invalid={Boolean(error)} {...props} />
      {error ? <NativeText variant="subhead" tone="danger">{error}</NativeText> : null}
    </Column>
  );
}
