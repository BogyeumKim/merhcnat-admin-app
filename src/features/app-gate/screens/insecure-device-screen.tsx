import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';

/**
 * 서버가 이 기기를 거부한 경우(`DEVICE_INSECURE`, 디자인 1-13). 잘못 감지된 경우를 위해 고객센터 연락 버튼을 함께 둔다.
 * 두 플랫폼 모두 종료 버튼은 두지 않는다(2026-11-22 결정: 설명과 고객센터 연락 버튼만). Android 하드웨어 뒤로가기는
 * 그대로 앱을 끝낸다(`useBlockBackButton` `'exit'`). iOS는 사용자가 홈으로 나가면 된다.
 */
export default function InsecureDeviceScreen() {
  const { t } = useTranslation();

  useBlockBackButton(true, 'exit');

  return (
    <BlockingScreenLayout
      icon={icons.insecureDevice}
      tone="warning"
      title={t('insecure.title')}
      description={t('insecure.body')}
      showSupport
    />
  );
}
