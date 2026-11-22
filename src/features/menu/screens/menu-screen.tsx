import { useTranslation } from '@/shared/i18n';
import { AppHeader } from '@/shared/ui/app-header';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { CategorySection } from '../components/category-section';
import { useMenuScreen } from '../hooks/use-menu-screen';

/** 모든 기능을 카테고리별로 묶어 보여주고, 계정 관련 동작을 함께 제공한다. 동작은 `useMenuScreen`에 있다. */
export default function MenuScreen() {
  const { t } = useTranslation();
  const menu = useMenuScreen();

  return (
    <TabScreen
      header={
        <AppHeader
          actions={[
            {
              icon: icons.notifications,
              label: t('home.notifications'),
              testID: 'menu-notifications',
              onPress: menu.openNotices,
            },
          ]}
        />
      }>
      <NativeText variant="title">{t('menu.title')}</NativeText>
      {menu.categories.map((category) => (
        <CategorySection
          key={category.id}
          title={t(`menu.categories.${category.id}`)}
          items={category.items.map((item) => item.id)}
          onPress={menu.openItem}
        />
      ))}
      <NativeButton variant="text" label={t('menu.signOut')} onPress={menu.signOut} />
    </TabScreen>
  );
}
