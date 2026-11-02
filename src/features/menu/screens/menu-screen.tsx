import { signOutLocally, useCapabilities } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { CategorySection } from '../components/category-section';
import { visibleCatalog } from '../model/catalog';
import { openMenuItem } from '../model/use-open-menu-item';

/** Every feature, grouped by category, plus the account actions. */
export default function MenuScreen() {
  const { t } = useTranslation();
  const categories = visibleCatalog(useCapabilities());

  return (
    <TabScreen>
      <NativeText variant="title">{t('menu.title')}</NativeText>
      {categories.map((category) => (
        <CategorySection
          key={category.id}
          title={t(`menu.categories.${category.id}`)}
          items={category.items.map((item) => item.id)}
          onPress={openMenuItem}
        />
      ))}
      <NativeButton variant="outlined" label={t('menu.signOut')} onPress={signOutLocally} />
    </TabScreen>
  );
}
