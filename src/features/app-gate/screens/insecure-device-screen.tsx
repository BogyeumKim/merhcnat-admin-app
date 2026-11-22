import { BackHandler, Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';
import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { StatusHeader } from '@/shared/ui/status-header';

/**
 * 서버가 이 기기를 거부한 경우(`DEVICE_INSECURE`). 화면에서 이동할 곳이 없고 나갈 길은 고객센터뿐이다.
 * Android는 앱을 종료할 수 있지만 iOS는 그런 API가 없고(스스로 종료하는 앱은 Apple이 거절함) 버튼은 Android 전용이다.
 */
export default function InsecureDeviceScreen() {
  const { t } = useTranslation();

  useBlockBackButton();

  return (
    <BrandedFormScreen
      footer={
        <>
          {process.env.EXPO_OS === 'android' ? (
            <NativeButton testID="insecure-exit" variant="ink" label={t('insecure.exit')} onPress={() => BackHandler.exitApp()} />
          ) : null}
          <NativeButton
            testID="insecure-contact"
            variant={process.env.EXPO_OS === 'android' ? 'tonal' : 'ink'}
            label={t('insecure.contact')}
            onPress={() => void Linking.openURL(`tel:${SUPPORT.phone}`)}
          />
        </>
      }>
      <StatusHeader tone="warning" icon={icons.insecureDevice} title={t('insecure.title')} body={t('insecure.body')} />
    </BrandedFormScreen>
  );
}
