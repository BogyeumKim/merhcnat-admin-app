import { Column, type TextInputProps } from '@expo/ui';
import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';

import { NativeField } from './native-field';
import { NativeText } from './native-text';
import { PasswordToggle } from './password-toggle';

type LabeledFieldProps = TextInputProps & {
  label: string;
  /** Translated field-level error, shown directly under the field. */
  error?: string | null;
};

/**
 * A field with a visible, persistent label above it and an inline error slot. The placeholder is only an example
 * value (or none), so the label is also passed as the accessible name. A secure field gets an eye icon at its end.
 */
export function LabeledField({ label, error, secureTextEntry, ...props }: LabeledFieldProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  return (
    <Column spacing={spacing.xs} style={{ width: '100%', paddingBottom: spacing.sm }}>
      <NativeText variant="label">{label}</NativeText>
      <NativeField
        accessibilityLabel={label}
        invalid={Boolean(error)}
        secureTextEntry={secureTextEntry && !revealed}
        trailing={
          secureTextEntry ? (
            <PasswordToggle
              revealed={revealed}
              label={revealed ? t('auth.hidePassword') : t('auth.showPassword')}
              onPress={() => setRevealed((value) => !value)}
            />
          ) : undefined
        }
        {...props}
      />
      {error ? <NativeText variant="subhead" tone="danger">{error}</NativeText> : null}
    </Column>
  );
}
