import NotificationsIcon from '@expo/material-symbols/notifications.xml';

import { signOutLocally, useCapabilities } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { AppHeader } from '@/shared/ui/app-header';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { CategorySection } from '../components/category-section';
import { openMenuItem } from '../hooks/use-open-menu-item';
import { visibleCatalog } from '../model/catalog';

/** Every feature, grouped by category, plus the account actions. */
export default function MenuScreen() {
  const { t } = useTranslation();
  const categories = visibleCatalog(useCapabilities());

  return (
    <TabScreen
      header={
        <AppHeader
          actions={[
            {
              icon: { ios: 'bell', android: NotificationsIcon },
              label: t('home.notifications'),
              testID: 'menu-notifications',
              onPress: () => openMenuItem('notices'),
            },
          ]}
        />
      }>
      <NativeText variant="title">{t('menu.title')}</NativeText>
      {categories.map((category) => (
        <CategorySection
          key={category.id}
          title={t(`menu.categories.${category.id}`)}
          items={category.items.map((item) => item.id)}
          onPress={openMenuItem}
        />
      ))}
      <NativeButton variant="text" label={t('menu.signOut')} onPress={signOutLocally} />
    </TabScreen>
  );
}
