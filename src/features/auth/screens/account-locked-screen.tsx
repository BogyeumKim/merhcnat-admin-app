import { useLocalSearchParams } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { StatusHeader } from '@/shared/ui/status-header';

import { useAccountNoticeActions } from '../hooks/use-account-notice-actions';
import { formatLockedAt } from '../model/locked';

/**
 * 서버가 관리자가 풀어줄 때까지 계정이 잠겼다고 알릴 때(`ACCOUNT_LOCKED`) 표시한다.
 * 의도적으로 재시도가 없다: 여기서 사용자가 할 수 있는 일은 결과를 바꾸지 않는다. 고객센터가 유일한 방법이다.
 */
export default function AccountLockedScreen() {
  const { t } = useTranslation();
  const { userIdMasked, lockedAt } = useLocalSearchParams<{ userIdMasked?: string; lockedAt?: string }>();
  const lockedTime = formatLockedAt(lockedAt, t('locked.today'));
  const rows = [
    ...(userIdMasked ? [{ label: t('locked.userIdLabel'), value: userIdMasked }] : []),
    ...(lockedTime ? [{ label: t('locked.lockedAtLabel'), value: lockedTime }] : []),
    { label: t('locked.unlockLabel'), value: t('locked.unlockValue') },
  ];

  const { back, call } = useAccountNoticeActions();

  return (
    <BrandedFormScreen
      footer={
        <>
          <NativeButton testID="locked-call" label={t('locked.call')} onPress={call} />
          <NativeButton testID="locked-back" variant="tonal" label={t('locked.back')} onPress={back} />
        </>
      }>
      <StatusHeader tone="danger" icon={icons.lock} title={t('locked.title')} body={t('locked.body')} />
      <InfoRows rows={rows} />
    </BrandedFormScreen>
  );
}
