import { useLocalSearchParams } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { SupportContactButtons } from '@/shared/ui/support-contact-buttons';

import { useAccountNoticeActions } from '../hooks/use-account-notice-actions';
import { formatLockedAt } from '../model/locked';

/**
 * 계정 잠김(`ACCOUNT_LOCKED`, 디자인 1-11). 횟수는 쓰지 않는다. 가린 아이디(`mer*****01`)와 잠긴 시각은 서버가 준 경우에만 행을 보인다
 * (아이디는 서버 마스킹 값만 쓰며 앱이 입력값으로 만들지 않는다). 재시도는 없고 고객센터 연락 + [로그인 화면으로].
 * Android 뒤로가기는 앱 종료(차단 화면 공통).
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
  const { back } = useAccountNoticeActions();

  useBlockBackButton(true, 'exit');

  return (
    <BlockingScreenLayout
      icon={icons.lock}
      tone="action"
      title={t('locked.title')}
      description={t('locked.body')}
      details={<InfoRows rows={rows} />}
      actions={
        <>
          <SupportContactButtons />
          <NativeButton testID="locked-back" variant="tonal" label={t('locked.back')} onPress={back} />
        </>
      }
    />
  );
}
