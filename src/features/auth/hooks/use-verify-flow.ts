import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { showErrorToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { useAuthErrorPresenter } from './use-auth-error-presenter';
import type { ChallengeMethod, ChallengeRequired } from '../model/schemas';
import { useSendCode } from '../mutations/use-send-code';
import { useVerifyCode } from '../mutations/use-verify-code';

/** Sheet heights per step: the choice steps never fill the screen; the code step grows with the keyboard. */
const CHOICE_DETENTS = [0.72];
const CODE_DETENTS = process.env.EXPO_OS === 'android' ? [1] : [0.7, 1];

/** Where the user is in a message-code flow once a code has been sent. Epoch ms, taken from the server's seconds. */
type SentCode = { method: ChallengeMethod; destination: string | null; expiresAt: number; resendAt: number };

export type VerifyStep = 'device' | 'method' | 'code';

function leaveVerification() {
  if (router.canGoBack()) router.back();
  else router.replace('/sign-in');
}

/**
 * Steps: confirm a new/changed device -> choose a delivery method (message codes only) -> enter the code. The screen
 * only renders the step; everything that decides what happens next is here.
 */
export function useVerifyFlow(challenge: ChallengeRequired) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const runOnce = useRunOnce();
  const isTotp = challenge.methods.some((option) => option.method === 'TOTP');

  // A new device (`NONE`) goes straight to choosing where to get the code (the Korpay design); only a device that replaces
  // another one (`CHANGED`) is asked first.
  const [deviceConfirmed, setDeviceConfirmed] = useState(challenge.deviceState !== 'CHANGED');
  const [sent, setSent] = useState<SentCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  // After an expired / used-up code a new code is needed right away, whatever the resend cooldown says.
  const [resendNow, setResendNow] = useState(false);

  useAnnounce(errorMessage);

  const step: VerifyStep = !deviceConfirmed ? 'device' : isTotp || sent ? 'code' : 'method';

  // Each step sets its own sheet detents (the route default is in `app/_layout.tsx`).
  const detents = step === 'code' ? CODE_DETENTS : CHOICE_DETENTS;
  useEffect(() => {
    navigation.setOptions({ sheetAllowedDetents: detents });
  }, [navigation, detents]);

  // The challenge is not cleared on cancel: emptying it before the sheet is gone would trigger the redirect in
  // `useVerifyRouteGuard`, which replaces the route mid-dismissal. The `removed` listener clears it.
  const cancel = leaveVerification;

  const presentError = useAuthErrorPresenter({
    onInline: (error) => {
      const remaining = Number(error.extras.remainingAttempts);
      setErrorCode(error.code);
      setErrorMessage(
        error.code === 'OTP_INVALID' && Number.isInteger(remaining) && remaining > 0
          ? t(isTotp ? 'errors.TOTP_INVALID_REMAINING' : 'errors.OTP_INVALID_REMAINING', { count: remaining })
          : t(`errors.${error.code}`),
      );
      if (error.code === 'OTP_EXPIRED') setResendNow(true);
    },
  });

  const handleError = (error: ApiError) => {
    if (error.code === 'CHALLENGE_EXPIRED') {
      // The challenge token is gone (expired): the only way forward is to sign in again from the start.
      showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
      cancel();
      return;
    }
    presentError(error);
  };

  const clearError = () => {
    setErrorMessage(null);
    setErrorCode(null);
  };
  const sendCode = useSendCode({ onMutate: clearError, onError: handleError });
  const verifyCode = useVerifyCode({ onMutate: clearError, onError: handleError });

  const choose = (method: ChallengeMethod) =>
    runOnce((done) =>
      sendCode.mutate(
        { channel: method },
        {
          onSuccess: (result) => {
            const now = Date.now();
            setResendNow(false);
            setSent({
              method,
              destination: result.destination ?? null,
              expiresAt: now + result.expiresInSeconds * 1000,
              resendAt: now + result.resendAfterSeconds * 1000,
            });
          },
          onSettled: done,
        },
      ),
    );

  const verify = (code: string) =>
    runOnce((done) =>
      verifyCode.mutate(
        { channel: sent?.method ?? 'TOTP', code },
        {
          onSuccess: (result) => {
            if (result.passwordChangeRequired) router.replace('/password-change');
          },
          onSettled: done,
        },
      ),
    );

  return {
    step,
    sent,
    errorMessage,
    resendNow,
    sending: sendCode.isPending,
    verifying: verifyCode.isPending,
    choose,
    verify,
    cancel,
    confirmDevice: () => setDeviceConfirmed(true),
    clearError,
    isTotp,
    /** The code ran out of time (or tries): a new one has to be requested. */
    expired: errorCode === 'OTP_EXPIRED',
    /** Back to choosing where to get the code (message codes only). */
    backToMethod: () => {
      setSent(null);
      clearError();
    },
  };
}
