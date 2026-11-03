import { useTranslation } from '@/shared/i18n';
import { LinkText } from '@/shared/ui/link-text';
import { NativeText } from '@/shared/ui/native-text';

import { useSecondsLeft } from '../hooks/use-seconds-left';

type ResendButtonProps = {
  /** Epoch ms when a new code may be requested (the server's `resendAfterSeconds` from the last send). */
  availableAt: number;
  pending: boolean;
  onResend: () => void;
};

/**
 * "Resend code": a quiet "27초 후 다시 받기" while the cooldown runs (so the server's resend limit is rarely hit), then a
 * dark underlined link. Render it with `key={availableAt}` so a new cooldown starts from a fresh count.
 */
export function ResendButton({ availableAt, pending, onResend }: ResendButtonProps) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(availableAt);

  if (secondsLeft > 0 || pending) {
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
