import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { SupportContactButtons } from '@/shared/ui/support-contact-buttons';

import { useMaintenance } from '../hooks/use-maintenance';

/**
 * 서버 점검 중 앱을 막는다(디자인 1-10). 제목·설명은 앱 문구(i18n)만 쓰고, 카드에는 시작·종료 예정 시각만 보여준다
 * (서버가 주지 않은 행은 숨김). 서버 `message`나 점검 사유는 표시하지 않는다. 닫을 수 없고 Android 뒤로가기는 앱 종료.
 * 분할 창은 `BlockingScreenLayout`이 왼쪽(로고·아이콘·제목·설명) / 오른쪽(카드·버튼)으로 나눈다. 동작은 `useMaintenance`.
 */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const { from, until, goHome } = useMaintenance();

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
      actions={
        <>
          <SupportContactButtons />
          <NativeButton testID="maintenance-home" label={t('maintenance.home')} onPress={goHome} />
        </>
      }
    />
  );
}
