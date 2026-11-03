import { Column, type TextInputProps } from '@expo/ui';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';

import { FormAlert } from './form-alert';
import { NativeField } from './native-field';
import { NativeText } from './native-text';
import { PasswordToggle } from './password-toggle';

type LabeledFieldProps = TextInputProps & {
  label: string;
  /** Translated field-level error, shown directly under the field. */
  error?: string | null;
  /** A control at the end of a plain field (for example "clear"). A secure field always gets the eye toggle instead. */
  trailing?: ReactElement;
};

/**
 * A field with a visible, persistent label above it and an inline error slot. The placeholder is only an example
 * value (or none), so the label is also passed as the accessible name. A secure field gets an eye icon at its end.
 */
export function LabeledField({ label, error, secureTextEntry, trailing, ...props }: LabeledFieldProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      <NativeText variant="fieldLabel" tone="secondary">
        {label}
      </NativeText>
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
          ) : (
            trailing
          )
        }
        {...props}
      />
      {error ? <FormAlert message={error} /> : null}
    </Column>
  );
}
