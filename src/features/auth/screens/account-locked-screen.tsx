import Lock from '@expo/material-symbols/lock.xml';
import { router } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { NativeButton } from '@/shared/ui/native-button';
import { StatusHeader } from '@/shared/ui/status-header';

import { authFlowActions } from '../model/auth-flow-store';

/**
 * Shown when the server says the account is locked until an administrator unlocks it (`ACCOUNT_LOCKED`).
 * There is deliberately no retry: nothing the user does here changes the result.
 */
export default function AccountLockedScreen() {
  const { t } = useTranslation();

  const back = () => {
    authFlowActions().clear();
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/sign-in');
  };

  return (
    <BrandedFormScreen footer={<NativeButton label={t('locked.back')} onPress={back} />}>
      <StatusHeader icon={{ ios: 'lock', android: Lock }} title={t('locked.title')} body={t('locked.body')} />
    </BrandedFormScreen>
  );
}
