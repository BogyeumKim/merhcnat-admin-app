import { CodeEntry } from '../components/code-entry';
import { DeviceNotice } from '../components/device-notice';
import { MethodChoice } from '../components/method-choice';
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

  if (flow.step === 'device') {
    return <DeviceNotice onContinue={flow.confirmDevice} onCancel={flow.cancel} />;
  }
  if (flow.step === 'method') {
    return (
      <MethodChoice
        methods={challenge.methods}
        pending={flow.sending}
        errorMessage={flow.errorMessage}
        onChoose={flow.choose}
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
              onResend: () => flow.choose(sent.method),
            }
          : undefined
      }
      onBack={sent ? flow.backToMethod : undefined}
      onCancel={flow.cancel}
    />
  );
}
