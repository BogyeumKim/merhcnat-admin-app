import { useTranslation } from '@/shared/i18n';
import { LinkText } from '@/shared/ui/link-text';
import { NativeText } from '@/shared/ui/native-text';

import { useSecondsLeft } from '../hooks/use-seconds-left';

type ResendButtonProps = {
  /** 새 코드를 요청할 수 있는 시각(epoch ms). 마지막 발송 때 서버가 준 `resendAfterSeconds` 기준. */
  availableAt: number;
  pending: boolean;
  onResend: () => void;
};

/**
 * "코드 재전송": 서버가 준 `resendAfterSeconds` 동안은 조용한 "27초 후 다시 받기"로 보여(연타 방지용 UI 타이머,
 * 서버는 같은 수단 대기를 강제하지 않는다), 이후 어두운 밑줄 링크가 된다. `key={availableAt}`로 렌더하면 새 타이머가 처음부터 카운트된다.
 */
export function ResendButton({ availableAt, pending, onResend }: ResendButtonProps) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(availableAt);

  // 보내는 중에는 "0초 후 다시 받기"가 아니라 진행 문구를 보인다(링크는 숨겨 연타를 막는다).
  if (pending) {
    return (
      <NativeText variant="subhead" tone="secondary">
        {t('auth.verify.sending')}
      </NativeText>
    );
  }
  if (secondsLeft > 0) {
    return (
      <NativeText variant="subhead" tone="secondary">
        {t('auth.verify.resendIn', { seconds: secondsLeft })}
      </NativeText>
    );
  }
  return (
    <LinkText testID="otp-resend" tone="strong" onPress={onResend}>
      {t('auth.verify.resend')}
    </LinkText>
  );
}
