import { router } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

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
      <NativeText variant="title">{t('locked.title')}</NativeText>
      <NativeText tone="secondary">{t('locked.body')}</NativeText>
    </BrandedFormScreen>
  );
}
