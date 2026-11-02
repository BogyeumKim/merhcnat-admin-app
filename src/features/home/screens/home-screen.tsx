import { Column } from '@expo/ui';

import { useCapabilities } from '@/features/auth';
import { CategorySection, openMenuItem, shortcutItems } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

/**
 * Home: today at a glance (a summary card, WebView later) and shortcuts to the entries this account uses most.
 * Everything else lives under the categories of the Menu tab, so this screen stays short instead of listing everything.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const shortcuts = shortcutItems(useCapabilities());

  return (
    <TabScreen>
      <NativeText variant="title">{t('home.title')}</NativeText>
      <Column spacing={spacing.xs} style={{ width: '100%', padding: spacing.md, borderRadius: 16, backgroundColor: colors.field }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.summaryTitle')}
        </NativeText>
        <NativeText variant="headline">{t('home.preparing')}</NativeText>
      </Column>
      <CategorySection title={t('home.shortcuts')} items={shortcuts} onPress={openMenuItem} />
    </TabScreen>
  );
}
