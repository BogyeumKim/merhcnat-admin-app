import { useCapabilities } from '@/features/auth';
import { CategorySection, openMenuItem, shortcutItems } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { TodaySummary } from '../components/today-summary';

/**
 * Home: today at a glance (sales, approvals, next payout; sample data until the server provides it) and shortcuts to the entries this account uses most.
 * Everything else lives under the categories of the Menu tab, so this screen stays short instead of listing everything.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const shortcuts = shortcutItems(useCapabilities());

  return (
    <TabScreen>
      <NativeText variant="title">{t('home.title')}</NativeText>
      <TodaySummary />
      <CategorySection title={t('home.shortcuts')} items={shortcuts} onPress={openMenuItem} />
    </TabScreen>
  );
}
