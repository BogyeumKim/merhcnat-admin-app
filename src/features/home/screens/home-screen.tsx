import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui/app-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/** Placeholder until the merchant overview (WebView) is wired in. */
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen>
      <AppText variant="title" accessibilityRole="header">
        {t('home.title')}
      </AppText>
      <AppText tone="secondary">{t('home.body')}</AppText>
      <AppText tone="secondary">{t('home.preparing')}</AppText>
    </TabScreen>
  );
}
