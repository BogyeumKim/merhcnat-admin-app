import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';

import { formatClock } from '../hooks/use-seconds-left';

/**
 * 현재 코드의 남은 시간("남은 시간 2:57"). 남은 초는 코드 단계(`CodeEntry`)가 한 번 계산해 넘긴다:
 * 0초가 되면 같은 값으로 칸을 잠그고 시간 초과 안내로 바꾸므로 타이머가 둘로 갈라지지 않게.
 */
export function CodeExpiry({ secondsLeft }: { secondsLeft: number }) {
  const { t } = useTranslation();

  return (
    <NativeText variant="subhead" tone="secondary" tabular>
      {t('auth.verify.expiresIn', { time: formatClock(secondsLeft) })}
    </NativeText>
  );
}
