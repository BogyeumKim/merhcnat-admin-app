import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { SupportContactButtons } from '@/shared/ui/support-contact-buttons';

import { useAccountNoticeActions } from '../hooks/use-account-notice-actions';

/** 정지된 계정(`ACCOUNT_SUSPENDED`). 잠김 화면과 같은 차단 화면 패턴: 재시도 없이 고객센터 연락 + [로그인 화면으로], 뒤로가기는 앱 종료. */
export default function AccountSuspendedScreen() {
  const { t } = useTranslation();
  const { back } = useAccountNoticeActions();

  useBlockBackButton(true, 'exit');

  return (
    <BlockingScreenLayout
      icon={icons.accountSuspended}
      tone="warning"
      title={t('suspended.title')}
      description={t('suspended.body')}
      actions={
        <>
          <SupportContactButtons />
          <NativeButton testID="suspended-back" variant="tonal" label={t('suspended.back')} onPress={back} />
        </>
      }
    />
  );
}
