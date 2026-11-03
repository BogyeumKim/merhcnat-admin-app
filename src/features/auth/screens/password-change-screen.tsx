import LockReset from '@expo/material-symbols/lock_reset.xml';
import { Column } from '@expo/ui';
import { Controller } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { LabeledField } from '@/shared/ui/labeled-field';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { PlainFormScreen } from '@/shared/ui/plain-form-screen';
import { StatusHeader } from '@/shared/ui/status-header';

import { PasswordRulesList } from '../components/password-rules';
import { usePasswordChange } from '../hooks/use-password-change';

/**
 * Shown right after sign-in when the server says the password is older than 90 days. There is no way past it until the
 * password is changed (unless the server allows "later"). Layout follows the Korpay design; the current-password field
 * is the one addition, because the server requires it.
 */
export default function PasswordChangeScreen() {
  const { t } = useTranslation();
  const { control, rules, matches, mismatch, currentError, newError, canSubmit, pending, submit, skip } = usePasswordChange();

  return (
    <PlainFormScreen
      footer={
        <>
          <NativeButton
            testID="password-change-submit"
            label={t('auth.passwordChange.submit')}
            disabled={!canSubmit}
            onPress={submit}
          />
          {skip ? <NativeButton testID="password-change-later" variant="text" label={t('auth.passwordChange.later')} disabled={pending} onPress={skip} /> : null}
        </>
      }>
      <Column style={{ width: '100%', paddingTop: spacing.lg }}>
        <StatusHeader icon={{ ios: 'lock.rotation', android: LockReset }} title={t('auth.passwordChange.title')} body={t('auth.passwordChange.body')} />
      </Column>
      <Controller
        control={control}
        name="currentPassword"
        render={({ field }) => (
          <LabeledField
            ref={field.ref}
            testID="password-change-current"
            label={t('auth.passwordChange.current')}
            error={currentError}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field }) => (
          <Column spacing={spacing.sm} style={{ width: '100%' }}>
            <LabeledField
              ref={field.ref}
              testID="password-change-new"
              label={t('auth.passwordChange.new')}
              error={newError}
              secureTextEntry
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
            <PasswordRulesList rules={rules} />
          </Column>
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <Column spacing={spacing.sm} style={{ width: '100%' }}>
            <LabeledField
              ref={field.ref}
              testID="password-change-confirm"
              label={t('auth.passwordChange.confirm')}
              secureTextEntry
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={submit}
            />
            {matches || mismatch ? (
              <NativeText variant="caption" tone={matches ? 'default' : 'danger'}>
                {matches ? t('auth.passwordChange.match') : t('auth.passwordChange.mismatch')}
              </NativeText>
            ) : null}
          </Column>
        )}
      />
    </PlainFormScreen>
  );
}
