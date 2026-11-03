import Cancel from '@expo/material-symbols/cancel.xml';
import { Column, Icon, Row, Spacer, useNativeState, type TextInputRef } from '@expo/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useValidationMessage } from '@/shared/forms/validation';
import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { LabeledField } from '@/shared/ui/labeled-field';
import { LinkText } from '@/shared/ui/link-text';
import { NativeButton } from '@/shared/ui/native-button';

import { LoginNotice } from './login-notice';
import { RememberCheckbox } from './remember-checkbox';
import { loginSchema, type LoginValues } from '../model/forms';
import { loadSavedUserId } from '../model/saved-user-id';

type LoginFormProps = {
  pending: boolean;
  /** Persistent form-level error from the server (for example wrong ID or password). */
  formError: string | null;
  /** Bump to clear the password field (after a rejected login). */
  passwordResetKey: number;
  onSubmit: (input: LoginValues, remember: boolean) => void;
};

/**
 * The whole sign-in screen body, like the Korpay design: wordmark and two-line title, boxed fields (the ID field with a
 * clear button, the password field with the eye), the help link, the pill button, and the notice card at the bottom.
 * react-hook-form is the single owner of the values and their validity: the button stays gray and disabled until the
 * schema passes (`isValid`). The native fields keep their own text (no `value` prop), so the text is cleared through the
 * field ref; React state only knows whether the ID field has text (for the clear button).
 */
export function LoginForm({ pending, formError, passwordResetKey, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const messageOf = useValidationMessage();
  const userIdRef = useRef<TextInputRef | null>(null);
  const passwordRef = useRef<TextInputRef | null>(null);
  const [hasUserId, setHasUserId] = useState(false);
  const [remember, setRemember] = useState(true);
  // The ID field's text is a native state so a saved ID can be put into it; its text is never copied to React state.
  const userIdText = useNativeState('');

  const {
    control,
    handleSubmit,
    resetField,
    setValue,
    formState: { isValid },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { userId: '', password: '' },
  });

  // "아이디 저장": put the saved ID into the field once it has been read from the secure store.
  useEffect(() => {
    let active = true;
    void loadSavedUserId().then((saved) => {
      if (!active || !saved) return;
      userIdText.set(saved);
      setValue('userId', saved, { shouldValidate: true });
      setHasUserId(true);
    });
    return () => {
      active = false;
    };
  }, [setValue, userIdText]);

  useEffect(() => {
    if (passwordResetKey > 0) {
      // Clear the native text first: if it reports an empty value, the reset below also drops the resulting error.
      passwordRef.current?.clear();
      resetField('password');
    }
  }, [passwordResetKey, resetField]);

  const submit = handleSubmit((values) => {
    if (!pending) onSubmit(values, remember);
  });

  const clearUserId = () => {
    userIdRef.current?.clear();
    userIdText.set('');
    resetField('userId');
    setHasUserId(false);
  };

  const canSubmit = isValid && !pending;

  return (
    <BrandedFormScreen
      tagline
      bottomNote={<LoginNotice />}
      footer={
        <NativeButton
          testID="login-submit"
          label={pending ? t('auth.signingIn') : t('auth.signIn')}
          disabled={!canSubmit}
          onPress={() => void submit()}
        />
      }>
      <Controller
        control={control}
        name="userId"
        render={({ field, fieldState }) => (
          <LabeledField
            ref={(instance) => {
              field.ref(instance);
              userIdRef.current = instance;
            }}
            testID="login-user-id"
            value={userIdText}
            label={t('auth.userId')}
            placeholder={t('auth.userIdPlaceholder')}
            error={messageOf(fieldState.error)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onChangeText={(text) => {
              setHasUserId(text.length > 0);
              field.onChange(text);
            }}
            onBlur={field.onBlur}
            onSubmitEditing={() => passwordRef.current?.focus()}
            trailing={
              hasUserId ? (
                <Column testID="login-clear-user-id" onPress={clearUserId} style={{ padding: spacing.sm + spacing.xs }}>
                  <Icon name={{ ios: 'xmark.circle.fill', android: Cancel }} size={20} color={colors.secondaryText} accessibilityLabel={t('auth.clearUserId')} />
                </Column>
              ) : undefined
            }
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
            placeholder={t('auth.passwordPlaceholder')}
            error={formError ?? messageOf(fieldState.error)}
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
      <Row alignment="center" style={{ width: '100%' }}>
        <RememberCheckbox testID="login-remember" value={remember} onValueChange={setRemember} label={t('auth.rememberId')} />
        <Spacer flexible />
        <LinkText testID="login-help" onPress={() => router.push('/login-help')}>
          {t('auth.loginHelp')}
        </LinkText>
      </Row>
    </BrandedFormScreen>
  );
}
