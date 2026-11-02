import { Stack, useLocalSearchParams } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { MENU_CATALOG, type MenuItemId } from '../model/catalog';

const KNOWN_IDS: readonly string[] = MENU_CATALOG.flatMap((category) => category.items.map((item) => item.id));

function isMenuItemId(value: unknown): value is MenuItemId {
  return typeof value === 'string' && KNOWN_IDS.includes(value);
}

/** Stands in for a feature whose screen (mostly a WebView) is not built yet. The title comes from the catalog entry. */
export default function FeaturePlaceholderScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = isMenuItemId(id) ? t(`menu.items.${id}.title`) : t('menu.title');

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title }} />
      <TabScreen>
        <NativeText variant="title">{title}</NativeText>
        <NativeText tone="secondary">{t('menu.preparing')}</NativeText>
      </TabScreen>
    </>
  );
}
