import { Stack, useLocalSearchParams } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { MENU_CATALOG, type MenuItemId } from '../model/catalog';

const KNOWN_IDS: readonly string[] = MENU_CATALOG.flatMap((category) => category.items.map((item) => item.id));

function isMenuItemId(value: unknown): value is MenuItemId {
  return typeof value === 'string' && KNOWN_IDS.includes(value);
}

/** 화면(대부분 WebView)이 아직 없는 기능의 임시 화면. 제목은 카탈로그 항목에서 가져와 네이티브 헤더에만 표시한다. */
export default function FeaturePlaceholderScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = isMenuItemId(id) ? t(`menu.items.${id}.title`) : t('menu.title');

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title }} />
      <TabScreen>
        <NativeText tone="secondary">{t('menu.preparing')}</NativeText>
      </TabScreen>
    </>
  );
}
