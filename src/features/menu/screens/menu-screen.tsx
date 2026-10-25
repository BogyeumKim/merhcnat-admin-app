import { signOutLocally } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui/app-text';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeHost } from '@/shared/ui/native-host';
import { TabScreen } from '@/shared/ui/tab-screen';

/** Account actions. More menu entries land here as the WebView screens are added. */
export default function MenuScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen>
      <AppText variant="title" accessibilityRole="header">
        {t('menu.title')}
      </AppText>
      <NativeHost>
        <NativeButton variant="outlined" label={t('menu.signOut')} onPress={signOutLocally} />
      </NativeHost>
    </TabScreen>
  );
}
