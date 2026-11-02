import { signOutLocally } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/** Account actions. More menu entries land here as the WebView screens are added. */
export default function MenuScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen>
      <NativeText variant="title">{t('menu.title')}</NativeText>
      <NativeButton variant="outlined" label={t('menu.signOut')} onPress={signOutLocally} />
    </TabScreen>
  );
}
