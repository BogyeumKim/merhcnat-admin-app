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
    return <DeviceNotice registeredUserId={challenge.registeredUserIdMasked} enteredUserId={challenge.enteredUserId} onContinue={flow.confirmDevice} onCancel={flow.cancel} />;
  }
  if (flow.step === 'method') {
    return (
      <MethodChoice
        methods={challenge.methods}
        recentMethod={challenge.recentMethod}
        sendingMethod={flow.sendingMethod}
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
      attempt={flow.attempt}
      onEdit={flow.clearError}
      onSubmit={flow.verify}
      expiresAt={sent?.expiresAt}
      resend={
        sent
          ? {
              availableAt: sent.resendAt,
              pending: flow.sending,
              onResend: flow.resend,
            }
          : undefined
      }
      onBack={sent ? flow.backToMethod : undefined}
      // 이메일 "다른 방법으로 받기"·시간 초과 링크: 이메일만 있는 계정은 고를 다른 수단이 없어 두지 않는다.
      onOtherMethod={sent && challenge.methods.length > 1 ? flow.backToMethod : undefined}
      onSwitchToSms={challenge.methods.some((option) => option.method === 'SMS') ? () => flow.send('SMS') : undefined}
      onCancel={flow.cancel}
    />
  );
}
