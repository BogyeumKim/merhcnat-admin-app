
import { signOutLocally, useCapabilities } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { AppHeader } from '@/shared/ui/app-header';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { CategorySection } from '../components/category-section';
import { visibleCatalog } from '../model/catalog';
import { openMenuItem } from '../model/open-menu-item';

/** 모든 기능을 카테고리별로 묶어 보여주고, 계정 관련 동작을 함께 제공한다. */
export default function MenuScreen() {
  const { t } = useTranslation();
  const categories = visibleCatalog(useCapabilities());

  return (
    <TabScreen
      header={
        <AppHeader
          actions={[
            {
              icon: icons.notifications,
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
      <NativeButton variant="text" label={t('menu.signOut')} onPress={() => navigateOnce(() => signOutLocally())} />
    </TabScreen>
  );
}
