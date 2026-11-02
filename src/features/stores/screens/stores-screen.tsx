import { useCapabilities } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/**
 * Placeholder: store info is a WebView. A merchant account opens its own store's detail, every other account type
 * gets the list of the stores below it (`storeInfo` capability), so the WebView path will depend on it.
 */
export default function StoresScreen() {
  const { t } = useTranslation();
  const { storeInfo } = useCapabilities();

  return (
    <TabScreen>
      <NativeText variant="title">{t('menu.items.stores.title')}</NativeText>
      <NativeText tone="secondary">{t(storeInfo === 'detail' ? 'stores.detailHint' : 'stores.listHint')}</NativeText>
      <NativeText tone="secondary">{t('menu.preparing')}</NativeText>
    </TabScreen>
  );
}
