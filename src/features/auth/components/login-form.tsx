import type { TextInputRef } from '@expo/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useValidationMessage } from '@/shared/forms/validation';
import { useTranslation } from '@/shared/i18n';
import { FormAlert } from '@/shared/ui/form-alert';
import { LabeledField } from '@/shared/ui/labeled-field';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import { loginSchema, type LoginValues } from '../model/forms';

type LoginFormProps = {
  pending: boolean;
  /** Persistent form-level error from the server (for example wrong ID or password). */
  formError: string | null;
  /** Bump to clear the password field (after a rejected login). */
  passwordResetKey: number;
  onSubmit: (input: LoginValues) => void;
};

/**
 * Renders inside an `@expo/ui` Host (see `BrandedFormScreen`). react-hook-form owns validation and the submit
 * values; the native fields keep their own text (no `value` prop), so the text is cleared through the field ref.
 */
export function LoginForm({ pending, formError, passwordResetKey, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();
  const messageOf = useValidationMessage();
  const passwordRef = useRef<TextInputRef | null>(null);

  const { control, handleSubmit, resetField } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userId: '', password: '' },
  });

  useEffect(() => {
    if (passwordResetKey > 0) {
      // Clear the native text first: if it reports an empty value, the reset below also drops the resulting error.
      passwordRef.current?.clear();
      resetField('password');
    }
  }, [passwordResetKey, resetField]);

  const submit = handleSubmit((values) => {
    if (!pending) onSubmit(values);
  });

  return (
    <>
      <NativeText variant="title">{t('auth.signInTitle')}</NativeText>
      <NativeText tone="secondary">{t('auth.signInDescription')}</NativeText>
      <Controller
        control={control}
        name="userId"
        render={({ field, fieldState }) => (
          <LabeledField
            ref={field.ref}
            label={t('auth.userId')}
            error={messageOf(fieldState.error)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <LabeledField
            ref={(instance) => {
              field.ref(instance);
              passwordRef.current = instance;
            }}
            label={t('auth.password')}
            error={messageOf(fieldState.error)}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void submit()}
          />
        )}
      />
      {formError ? <FormAlert message={formError} /> : null}
      <NativeButton
        label={pending ? t('auth.signingIn') : t('auth.signIn')}
        disabled={pending}
        onPress={() => void submit()}
      />
    </>
  );
}
