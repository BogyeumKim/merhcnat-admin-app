import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/** Placeholder until the merchant overview (WebView) is wired in. */
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen>
      <NativeText variant="title">{t('home.title')}</NativeText>
      <NativeText tone="secondary">{t('home.body')}</NativeText>
      <NativeText tone="secondary">{t('home.preparing')}</NativeText>
    </TabScreen>
  );
}
