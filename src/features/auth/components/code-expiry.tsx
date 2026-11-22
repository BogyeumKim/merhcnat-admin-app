import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';

import { formatClock, useSecondsLeft } from '../hooks/use-seconds-left';

/**
 * 현재 코드의 남은 시간. `key={expiresAt}`로 렌더하면 새 코드에서 시계가 다시 시작된다.
 * 만료되면 같은 자리에 짧은 문구만 둔다: 오른쪽 "인증번호 다시 받기" 링크와 한 줄에 들어가야 한다(긴 문장이면 링크가 세로로 찌그러진다).
 */
export function CodeExpiry({ expiresAt }: { expiresAt: number }) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(expiresAt);

  return secondsLeft > 0 ? (
    <NativeText variant="subhead" tone="secondary">
      {t('auth.verify.expiresIn', { time: formatClock(secondsLeft) })}
    </NativeText>
  ) : (
    <NativeText variant="subhead" tone="danger">
      {t('auth.verify.expiredShort')}
    </NativeText>
  );
}
