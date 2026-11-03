import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { showSuccessToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { useAuthErrorPresenter } from './use-auth-error-presenter';
import { passwordChangeSchema, type PasswordChangeValues } from '../model/forms';
import { evaluatePasswordRules, passwordLooksValid } from '../model/password-rules';
import { markPasswordChanged, usePasswordChangeSkippable } from '../model/session-store';
import { useChangePassword } from '../mutations/use-change-password';

/**
 * Behavior of the password-change screen: live rule hints, the "same twice" check, submitting once at a time, and what
 * each server failure means for the screen (wrong current password under that field; broken rule / reused password
 * under the new one and in the rule list). The screen only renders what this returns.
 */
export function usePasswordChange() {
  const { t } = useTranslation();
  const skippable = usePasswordChangeSkippable();
  const runOnce = useRunOnce();
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [violations, setViolations] = useState<readonly string[]>([]);
  const [reused, setReused] = useState(false);

  const { control, handleSubmit, formState } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = useWatch({ control, name: 'newPassword' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });

  useAnnounce(currentError ?? newError);

  const clearErrors = () => {
    setCurrentError(null);
    setNewError(null);
    setViolations([]);
    setReused(false);
  };

  const presentError = useAuthErrorPresenter({
    onInline: (error) => {
      if (error.code === 'CURRENT_PASSWORD_INVALID') {
        const remaining = Number(error.extras.remainingAttempts);
        setCurrentError(
          Number.isInteger(remaining) && remaining > 0
            ? `${t('errors.CURRENT_PASSWORD_INVALID')} (${remaining})`
            : t('errors.CURRENT_PASSWORD_INVALID'),
        );
      } else if (error.code === 'PASSWORD_POLICY_VIOLATION') {
        const list = error.extras.violations;
        setViolations(Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : []);
        setNewError(t('errors.PASSWORD_POLICY_VIOLATION'));
      } else if (error.code === 'PASSWORD_REUSED') {
        setReused(true);
        setNewError(t('errors.PASSWORD_REUSED'));
      } else {
        setNewError(t(`errors.${error.code}`));
      }
    },
  });

  const change = useChangePassword({
    onMutate: clearErrors,
    onSuccess: () => {
      showSuccessToast({ id: 'password-changed', title: t('auth.passwordChange.done') });
      router.replace('/');
    },
    onError: presentError,
  });

  const matches = confirmPassword.length > 0 && confirmPassword === newPassword;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit = formState.isValid && passwordLooksValid(newPassword) && matches && !change.isPending;

  const submit = handleSubmit(({ currentPassword, newPassword: next }) =>
    runOnce((done) =>
      change.mutate(
        { currentPassword, newPassword: next },
        {
          onSettled: () => {
            done();
            change.reset();
          },
        },
      ),
    ),
  );

  return {
    control,
    rules: evaluatePasswordRules(newPassword, violations, reused),
    matches,
    mismatch,
    currentError,
    newError,
    canSubmit,
    pending: change.isPending,
    submit: () => void submit(),
    /** Only where the server allows it. Lifts the gate without changing anything. */
    skip: skippable ? markPasswordChanged : undefined,
  };
}
