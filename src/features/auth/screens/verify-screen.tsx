import { router, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { maintenanceHref } from '@/features/maintenance';
import { presentationOf } from '@/shared/api/error-presentation';
import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { showErrorToast, showSuccessToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { CodeEntry } from '../components/code-entry';
import { DeviceNotice } from '../components/device-notice';
import { MethodChoice } from '../components/method-choice';
import { authFlowActions, useAuthChallenge, useAuthFlowActions, useAuthFlowId } from '../model/auth-flow-store';
import type { ChallengeMethod, ChallengeRequired } from '../model/schemas';
import { useIsSignedIn } from '../model/session-store';
import { useSendCode } from '../mutations/use-send-code';
import { useVerifyCode } from '../mutations/use-verify-code';

/** Where the user is in a message-code flow once a code has been sent. Epoch ms, taken from the server's seconds. */
type SentCode = { method: ChallengeMethod; destination: string | null; expiresAt: number; resendAt: number };

function leaveVerification() {
  if (router.canGoBack()) router.back();
  else router.replace('/sign-in');
}

export default function VerifyScreen() {
  const challenge = useAuthChallenge();
  const flowId = useAuthFlowId();
  const isSignedIn = useIsSignedIn();
  const navigation = useNavigation();

  // Whatever closes the sheet (Cancel, dragging it down, the Android back gesture, a finished sign-in), the half-finished
  // challenge goes with it. `removed` fires after the screen unmounted, so this cannot trigger the redirect below; per the
  // event's docs the unsubscription waits for the next microtask.
  useEffect(() => {
    const unsubscribe = navigation.addListener('removed', () => authFlowActions().clear());
    return () => queueMicrotask(unsubscribe);
  }, [navigation]);

  // Opened without a pending challenge (for example a stale deep link): go back to sign-in.
  useEffect(() => {
    if (!challenge && !isSignedIn) router.replace('/sign-in');
  }, [challenge, isSignedIn]);

  return challenge ? <VerifyFlow key={flowId} challenge={challenge} /> : null;
}

/** Steps: confirm new/changed device -> choose a delivery method (message codes only) -> enter the code. */
function VerifyFlow({ challenge }: { challenge: ChallengeRequired }) {
  const { t } = useTranslation();
  const { clear } = useAuthFlowActions();
  const isTotp = challenge.methods.some((option) => option.method === 'TOTP');
  const needsDeviceConfirmation = challenge.deviceState !== 'MATCH';

  const [deviceConfirmed, setDeviceConfirmed] = useState(!needsDeviceConfirmation);
  const [sent, setSent] = useState<SentCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // After an expired / used-up code a new code is needed right away, whatever the resend cooldown says.
  const [resendNow, setResendNow] = useState(false);
  const inFlight = useRef(false);

  useAnnounce(errorMessage);

  // The challenge is not cleared here: emptying it before the sheet is gone would trigger the redirect in `VerifyScreen`,
  // which replaces the route mid-dismissal (the sign-in screen seemed to push in again). The `removed` listener clears it.
  const cancel = () => {
    leaveVerification();
  };

  // Where a failure is shown depends on its kind (see shared/api/error-presentation.ts).
  const handleError = (error: ApiError) => {
    if (error.code === 'CHALLENGE_EXPIRED') {
      // The challenge token is gone (expired): the only way forward is to sign in again from the start.
      showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
      cancel();
      return;
    }
    switch (presentationOf(error.code)) {
      case 'maintenance':
        router.push(maintenanceHref(error));
        return;
      case 'locked':
        // Locked until an administrator unlocks it: nothing to retry, so the flow ends here.
        clear();
        router.push('/account-locked');
        return;
      case 'toast':
        showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
        return;
      case 'inline': {
        const remaining = Number(error.extras.remainingAttempts);
        setErrorMessage(
          error.code === 'OTP_INVALID' && Number.isInteger(remaining) && remaining > 0
            ? t('errors.OTP_INVALID_REMAINING', { count: remaining })
            : t(`errors.${error.code}`),
        );
        if (error.code === 'OTP_EXPIRED') setResendNow(true);
        return;
      }
    }
  };

  const sendCode = useSendCode({ onMutate: () => setErrorMessage(null), onError: handleError });
  const verifyCode = useVerifyCode({ onMutate: () => setErrorMessage(null), onError: handleError });

  // One request at a time: blocks a second tap/Enter that arrives before React re-renders with `isPending`.
  const runOnce = (start: (done: () => void) => void) => {
    if (inFlight.current) return;
    inFlight.current = true;
    start(() => {
      inFlight.current = false;
    });
  };

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
            showSuccessToast({ id: 'code-sent', title: t('toast.codeSent'), description: result.destination });
          },
          onSettled: done,
        },
      ),
    );

  const verify = (code: string) =>
    runOnce((done) =>
      verifyCode.mutate({ channel: sent?.method ?? 'TOTP', code }, { onSettled: done }),
    );

  const deviceState = challenge.deviceState;
  const step = !deviceConfirmed ? 'device' : isTotp || sent ? 'code' : 'method';

  if (step === 'device' && deviceState !== 'MATCH') {
    return <DeviceNotice state={deviceState} onContinue={() => setDeviceConfirmed(true)} onCancel={cancel} />;
  }
  if (step === 'method') {
    return (
      <MethodChoice
        methods={challenge.methods}
        pending={sendCode.isPending}
        errorMessage={errorMessage}
        onChoose={choose}
        onCancel={cancel}
      />
    );
  }
  return (
    <CodeEntry
      destination={sent?.destination ?? null}
      pending={verifyCode.isPending}
      serverError={errorMessage}
      onEdit={() => setErrorMessage(null)}
      onSubmit={verify}
      expiresAt={sent?.expiresAt}
      resend={
        sent
          ? {
              availableAt: resendNow ? 0 : sent.resendAt,
              pending: sendCode.isPending,
              onResend: () => choose(sent.method),
            }
          : undefined
      }
      onCancel={cancel}
    />
  );
}
