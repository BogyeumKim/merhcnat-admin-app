import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { maintenanceHref } from '@/features/maintenance';
import { presentationOf } from '@/shared/api/error-presentation';
import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { showErrorToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { LoginForm } from '../components/login-form';
import { useLogin } from '../mutations/use-login';

export default function SignInScreen() {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordResetKey, setPasswordResetKey] = useState(0);
  const inFlight = useRef(false);

  useAnnounce(formError);

  const login = useLogin({
    onMutate: () => setFormError(null),
    onSuccess: (result) => {
      setPasswordResetKey((key) => key + 1);
      if (result.status === 'CHALLENGE_REQUIRED') router.push('/verify');
    },
    onError: (error) => {
      const title = t(`errors.${error.code}`);
      switch (presentationOf(error.code)) {
        case 'maintenance':
          router.push(maintenanceHref(error));
          return;
        case 'toast':
          // Same id per error code: repeated failures update one toast instead of piling up copies.
          showErrorToast({ id: `error:${error.code}`, title });
          return;
        case 'inline':
          setFormError(title);
          if (error.code === 'INVALID_CREDENTIALS') setPasswordResetKey((key) => key + 1);
          return;
      }
    },
  });

  // `inFlight` blocks a second submit fired before React re-renders with `isPending`; `reset()` drops the
  // mutation's variables (the password) from memory as soon as the call is settled.
  const submit = (input: { userId: string; password: string }) => {
    if (inFlight.current) return;
    inFlight.current = true;
    login.mutate(input, {
      onSettled: () => {
        inFlight.current = false;
        login.reset();
      },
    });
  };

  return (
    <BrandedFormScreen>
      <LoginForm
        pending={login.isPending}
        formError={formError}
        passwordResetKey={passwordResetKey}
        onSubmit={submit}
      />
    </BrandedFormScreen>
  );
}
