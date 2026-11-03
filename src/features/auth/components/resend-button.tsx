import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';

import { useSecondsLeft } from '../hooks/use-seconds-left';

type ResendButtonProps = {
  /** Epoch ms when a new code may be requested (the server's `resendAfterSeconds` from the last send). */
  availableAt: number;
  pending: boolean;
  onResend: () => void;
};

/**
 * "Resend code" with a cooldown, so the server's resend limit is rarely hit. Render it with `key={availableAt}`
 * so a new cooldown starts from a fresh count.
 */
export function ResendButton({ availableAt, pending, onResend }: ResendButtonProps) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(availableAt);
  const waiting = secondsLeft > 0;

  return (
    <NativeButton
      compact
      variant="text"
      disabled={waiting || pending}
      label={waiting ? t('auth.verify.resendIn', { seconds: secondsLeft }) : t('auth.verify.resend')}
      onPress={onResend}
    />
  );
}
