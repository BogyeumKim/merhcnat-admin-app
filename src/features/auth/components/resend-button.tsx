import { useEffect, useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';

const COOLDOWN_SECONDS = 30;

const secondsUntil = (endAt: number) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

/**
 * "Resend code" with a cooldown, so the server's resend limits are rarely hit. The countdown is computed from an end
 * time (not by counting ticks), so it stays correct after the app was in the background.
 */
export function ResendButton({ onResend, pending }: { onResend: () => void; pending: boolean }) {
  const { t } = useTranslation();
  const [endAt, setEndAt] = useState(() => Date.now() + COOLDOWN_SECONDS * 1000);
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsUntil(endAt)), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, endAt]);

  const waiting = secondsLeft > 0;

  return (
    <NativeButton
      variant="text"
      disabled={waiting || pending}
      label={waiting ? t('auth.verify.resendIn', { seconds: secondsLeft }) : t('auth.verify.resend')}
      onPress={() => {
        setEndAt(Date.now() + COOLDOWN_SECONDS * 1000);
        setSecondsLeft(COOLDOWN_SECONDS);
        onResend();
      }}
    />
  );
}
