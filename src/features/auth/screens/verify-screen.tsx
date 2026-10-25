import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { maintenanceHref } from '@/features/maintenance';
import { presentationOf } from '@/shared/api/error-presentation';
import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';
import { showErrorToast, showSuccessToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { CodeEntry } from '../components/code-entry';
import { DeviceNotice } from '../components/device-notice';
import { MethodChoice } from '../components/method-choice';
import { useAuthChallenge, useAuthFlowActions } from '../model/auth-flow-store';
import type { ChallengeRequired } from '../model/schemas';
import { useIsSignedIn } from '../model/session-store';
import { useSendCode } from '../mutations/use-send-code';
import { useVerifyCode } from '../mutations/use-verify-code';

type ChallengeOption = ChallengeRequired['methods'][number];

function leaveVerification() {
  if (router.canGoBack()) router.back();
  else router.replace('/sign-in');
}

export default function VerifyScreen() {
  const challenge = useAuthChallenge();
  const isSignedIn = useIsSignedIn();

  // Opened without a pending challenge (for example a stale deep link): go back to sign-in.
  useEffect(() => {
    if (!challenge && !isSignedIn) router.replace('/sign-in');
  }, [challenge, isSignedIn]);

  return challenge ? <VerifyFlow key={challenge.challengeId} challenge={challenge} /> : null;
}

/** Steps: confirm new/changed device -> choose a delivery method (message codes only) -> enter the code. */
function VerifyFlow({ challenge }: { challenge: ChallengeRequired }) {
  const { t } = useTranslation();
  const { clear } = useAuthFlowActions();
  const isTotp = challenge.methods.some((option) => option.method === 'TOTP');
  const needsDeviceConfirmation = challenge.deviceState !== 'MATCH';

  const [deviceConfirmed, setDeviceConfirmed] = useState(!needsDeviceConfirmation);
  const [sentTo, setSentTo] = useState<ChallengeOption | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  useAnnounce(errorMessage);

  const cancel = () => {
    clear();
    leaveVerification();
  };

  // Where a failure is shown depends on its kind (see shared/api/error-presentation.ts).
  const handleError = (error: ApiError) => {
    const title = t(`errors.${error.code}`);
    switch (presentationOf(error.code)) {
      case 'maintenance':
        router.push(maintenanceHref(error));
        return;
      case 'toast':
        showErrorToast({ id: `error:${error.code}`, title });
        return;
      case 'inline':
        setErrorMessage(title);
        return;
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

  const choose = (option: ChallengeOption) =>
    runOnce((done) =>
      sendCode.mutate(
        { challengeId: challenge.challengeId, method: option.method },
        {
          onSuccess: () => {
            setSentTo(option);
            showSuccessToast({
              id: 'code-sent',
              title: t('toast.codeSent'),
              description: option.destination,
            });
          },
          onSettled: done,
        },
      ),
    );

  const verify = (code: string) =>
    runOnce((done) =>
      verifyCode.mutate(
        { challengeId: challenge.challengeId, code, confirmDevice: needsDeviceConfirmation },
        { onSettled: done },
      ),
    );

  const deviceState = challenge.deviceState;
  const step = !deviceConfirmed ? 'device' : isTotp || sentTo ? 'code' : 'method';

  return (
    <SheetFormScreen>
      {step === 'device' && deviceState !== 'MATCH' ? (
        <DeviceNotice state={deviceState} onContinue={() => setDeviceConfirmed(true)} onCancel={cancel} />
      ) : null}
      {step === 'method' ? (
        <MethodChoice
          methods={challenge.methods}
          pending={sendCode.isPending}
          errorMessage={errorMessage}
          onChoose={choose}
          onCancel={cancel}
        />
      ) : null}
      {step === 'code' ? (
        <CodeEntry
          destination={sentTo?.destination ?? null}
          pending={verifyCode.isPending}
          serverError={errorMessage}
          onEdit={() => setErrorMessage(null)}
          onSubmit={verify}
          onResend={sentTo ? () => choose(sentTo) : undefined}
          resendPending={sendCode.isPending}
          onCancel={cancel}
        />
      ) : null}
    </SheetFormScreen>
  );
}
