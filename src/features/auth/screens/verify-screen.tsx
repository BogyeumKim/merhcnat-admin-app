import { CodeEntry } from '../components/code-entry';
import { DeviceNotice } from '../components/device-notice';
import { MethodChoice } from '../components/method-choice';
import { NoContactNotice } from '../components/no-contact-notice';
import { useVerifyFlow } from '../hooks/use-verify-flow';
import { useVerifyRouteGuard } from '../hooks/use-verify-route-guard';
import type { ChallengeRequired } from '../model/schemas';

export default function VerifyScreen() {
  const { challenge, flowId } = useVerifyRouteGuard();

  return challenge ? <VerifyFlow key={flowId} challenge={challenge} /> : null;
}

function VerifyFlow({ challenge }: { challenge: ChallengeRequired }) {
  const flow = useVerifyFlow(challenge);
  const { sent } = flow;

  if (flow.step === 'noContact') return <NoContactNotice onClose={flow.cancel} />;
  if (flow.step === 'device') {
    return <DeviceNotice registeredUserId={challenge.registeredUserIdMasked} enteredUserId={challenge.enteredUserId} otherAccount={challenge.deviceRegisteredToOtherAccount} onContinue={flow.confirmDevice} onCancel={flow.cancel} />;
  }
  if (flow.step === 'method') {
    return (
      <MethodChoice
        methods={challenge.methods}
        recentMethod={challenge.recentMethod}
        pending={flow.sending}
        errorMessage={flow.errorMessage}
        onChoose={flow.send}
        onCancel={flow.cancel}
      />
    );
  }
  return (
    <CodeEntry
      method={sent?.method ?? 'TOTP'}
      expired={flow.expired}
      destination={sent?.destination ?? null}
      pending={flow.verifying}
      serverError={flow.errorMessage}
      onEdit={flow.clearError}
      onSubmit={flow.verify}
      expiresAt={sent?.expiresAt}
      resend={
        sent
          ? {
              availableAt: flow.resendNow ? 0 : sent.resendAt,
              pending: flow.sending,
              onResend: () => flow.send(sent.method),
            }
          : undefined
      }
      onBack={sent ? flow.backToMethod : undefined}
      onSwitchToSms={challenge.methods.some((option) => option.method === 'SMS') ? () => flow.send('SMS') : undefined}
      onCancel={flow.cancel}
    />
  );
}
