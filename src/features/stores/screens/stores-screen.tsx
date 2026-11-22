import { useCapabilities } from '@/features/auth';
import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/**
 * 임시 화면: 가맹점 정보는 WebView다. 가맹점 계정은 자기 가맹점 상세를, 그 외 계정은 하위 가맹점 목록을 연다
 * (`storeInfo` capability에 따라 WebView 경로가 달라진다).
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
