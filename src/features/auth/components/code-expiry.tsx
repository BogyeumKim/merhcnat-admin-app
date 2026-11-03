import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';

import { formatClock, useSecondsLeft } from '../hooks/use-seconds-left';

/** Time left for the current code. Render with `key={expiresAt}` so a new code restarts the clock. */
export function CodeExpiry({ expiresAt }: { expiresAt: number }) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(expiresAt);

  return secondsLeft > 0 ? (
    <NativeText variant="subhead" tone="secondary">
      {t('auth.verify.expiresIn', { time: formatClock(secondsLeft) })}
    </NativeText>
  ) : (
    <NativeText variant="subhead" tone="danger">
      {t('errors.OTP_EXPIRED')}
    </NativeText>
  );
}
