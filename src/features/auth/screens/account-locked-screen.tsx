import Lock from '@expo/material-symbols/lock.xml';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';
import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { StatusHeader } from '@/shared/ui/status-header';

import { authFlowActions } from '../model/auth-flow-store';

/**
 * Shown when the server says the account is locked until an administrator unlocks it (`ACCOUNT_LOCKED`).
 * There is deliberately no retry: nothing the user does here changes the result. The way forward is the customer center.
 */
export default function AccountLockedScreen() {
  const { t } = useTranslation();

  const back = () => {
    authFlowActions().clear();
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/sign-in');
  };
  const call = () => {
    void Linking.openURL(`tel:${SUPPORT.phone}`);
  };

  return (
    <BrandedFormScreen
      footer={
        <>
          <NativeButton testID="locked-call" label={t('locked.call')} onPress={call} />
          <NativeButton testID="locked-back" variant="tonal" label={t('locked.back')} onPress={back} />
        </>
      }>
      <StatusHeader icon={{ ios: 'lock', android: Lock }} title={t('locked.title')} body={t('locked.body')} />
      <InfoRows rows={[{ label: t('locked.unlockLabel'), value: t('locked.unlockValue') }]} />
    </BrandedFormScreen>
  );
}
