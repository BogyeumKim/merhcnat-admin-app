import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';

import { useMaintenance } from '../hooks/use-maintenance';

/**
 * 서버 점검 중 앱을 막는다(디자인 1-10). 제목·설명은 앱 문구(i18n)만 쓰고, 카드에는 시작·종료 예정 시각만 보여준다
 * (서버가 주지 않은 행은 숨김). 서버 `message`나 점검 사유는 표시하지 않는다. 닫을 수 없고 Android 뒤로가기는 앱 종료.
 * 아래 버튼은 iOS/Android 모두 [로그인 화면으로](항상 로그인으로 이동).
 * 배치는 `BlockingScreenLayout`(모든 창 한 컬럼, 버튼 아래 고정). 동작은 `useMaintenance`.
 */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const { from, until, goToSignIn } = useMaintenance();

  useBlockBackButton(true, 'exit');

  const rows = [
    ...(from ? [{ label: t('maintenance.start'), value: from }] : []),
    ...(until ? [{ label: t('maintenance.end'), value: until }] : []),
  ];

  return (
    <BlockingScreenLayout
      icon={icons.maintenance}
      title={t('maintenance.title')}
      description={t('maintenance.body')}
      details={rows.length > 0 ? <InfoRows rows={rows} /> : null}
      showSupport
      primaryAction={{ testID: 'maintenance-sign-in', label: t('maintenance.goToSignIn'), onPress: goToSignIn }}
    />
  );
}
