import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/** Placeholder: the transaction list is a WebView (`docs/architecture/webview.md`). */
export default function TransactionsScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen>
      <NativeText variant="title">{t('menu.items.transactions.title')}</NativeText>
      <NativeText tone="secondary">{t('menu.preparing')}</NativeText>
    </TabScreen>
  );
}
