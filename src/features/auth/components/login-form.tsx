import type { TextInputRef } from '@expo/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Application from 'expo-application';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useValidationMessage } from '@/shared/forms/validation';
import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { FormAlert } from '@/shared/ui/form-alert';
import { LabeledField } from '@/shared/ui/labeled-field';
import { NativeButton } from '@/shared/ui/native-button';

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
 * The whole sign-in screen body: branded layout, fields, and the primary button right under them.
 * react-hook-form is the single owner of the values and their validity: the button stays gray and disabled until the
 * schema passes (`isValid`). The native fields keep their own text (no `value` prop), so the text is cleared through the
 * field ref.
 */
export function LoginForm({ pending, formError, passwordResetKey, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();
  const messageOf = useValidationMessage();
  const passwordRef = useRef<TextInputRef | null>(null);

  const {
    control,
    handleSubmit,
    resetField,
    formState: { isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
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

  const canSubmit = isValid && !pending;

  return (
    <BrandedFormScreen tagline bottomNote={t('auth.version', { version: Application.nativeApplicationVersion ?? '' })}>
      <Controller
        control={control}
        name="userId"
        render={({ field, fieldState }) => (
          <LabeledField
            ref={field.ref}
            testID="login-user-id"
            label={t('auth.userId')}
            placeholder={t('auth.userIdPlaceholder')}
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
            testID="login-password"
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
        testID="login-submit"
        label={pending ? t('auth.signingIn') : t('auth.signIn')}
        disabled={!canSubmit}
        onPress={() => void submit()}
      />
    </BrandedFormScreen>
  );
}
