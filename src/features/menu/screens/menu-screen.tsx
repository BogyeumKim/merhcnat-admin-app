import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui/app-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/** More menu entries land here as the WebView screens are added. */
export default function MenuScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen>
      <AppText variant="title" accessibilityRole="header">
        {t('menu.title')}
      </AppText>
    </TabScreen>
  );
}
