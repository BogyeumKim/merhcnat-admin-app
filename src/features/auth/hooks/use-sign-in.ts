import { router } from 'expo-router';
import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { useAnnounce } from '@/shared/ui/use-announce';

import { useAuthErrorPresenter } from './use-auth-error-presenter';
import { useLogin } from '../mutations/use-login';

/**
 * The sign-in screen's behavior: submit once at a time, show the failure, move on to verification when the server asks
 * for it. `passwordResetKey` changes whenever the password field must be cleared (after a send or a rejected password).
 */
export function useSignIn() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordResetKey, setPasswordResetKey] = useState(0);
  const runOnce = useRunOnce();

  useAnnounce(formError);

  const presentError = useAuthErrorPresenter({
    onInline: (error) => {
      setFormError(t(`errors.${error.code}`));
      if (error.code === 'INVALID_CREDENTIALS') setPasswordResetKey((key) => key + 1);
    },
  });

  const login = useLogin({
    onMutate: () => setFormError(null),
    onSuccess: (result) => {
      setPasswordResetKey((key) => key + 1);
      if (result.status === 'CHALLENGE_REQUIRED') router.push('/verify');
    },
    onError: presentError,
  });

  // `reset()` drops the mutation's variables (the password) from memory as soon as the call is settled.
  const submit = (input: { userId: string; password: string }) =>
    runOnce((done) =>
      login.mutate(input, {
        onSettled: () => {
          done();
          login.reset();
        },
      }),
    );

  return { pending: login.isPending, formError, passwordResetKey, submit };
}
