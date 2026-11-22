import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { StatusHeader } from '@/shared/ui/status-header';

import { useAccountNoticeActions } from '../hooks/use-account-notice-actions';

/** 서버가 정지된 계정이라고 알릴 때(`ACCOUNT_SUSPENDED`) 표시한다. 재시도 없이 고객센터 문의만 안내한다. */
export default function AccountSuspendedScreen() {
  const { t } = useTranslation();
  const { back, call } = useAccountNoticeActions();

  return (
    <BrandedFormScreen
      footer={
        <>
          <NativeButton testID="suspended-call" label={t('suspended.call')} onPress={call} />
          <NativeButton testID="suspended-back" variant="tonal" label={t('suspended.back')} onPress={back} />
        </>
      }>
      <StatusHeader tone="warning" icon={icons.accountSuspended} title={t('suspended.title')} body={t('suspended.body')} />
    </BrandedFormScreen>
  );
}
