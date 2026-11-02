import NotificationsIcon from '@expo/material-symbols/notifications.xml';
import { Row, Spacer } from '@expo/ui';
import { router } from 'expo-router';

import { useCapabilities } from '@/features/auth';
import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { AppHeader } from '@/shared/ui/app-header';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { NoticeList } from '../components/notice-list';
import { PaymentMix } from '../components/payment-mix';
import { SalesTrend } from '../components/sales-trend';
import { StoreRanking } from '../components/store-ranking';
import { TodaySummary } from '../components/today-summary';

/**
 * Home: the brand bar (logo, notifications), the store and today's sales, the next payout and month, and the latest notices. Everything else
 * lives under the Menu tab's categories. Numbers are sample data until the server (or the WebView) provides them.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { showHierarchyFilter } = useCapabilities();

  return (
    <TabScreen
      header={
        <AppHeader
          actions={[
            {
              icon: { ios: 'bell', android: NotificationsIcon },
              label: t('home.notifications'),
              testID: 'home-notifications',
              onPress: () => openMenuItem('notices'),
            },
          ]}
        />
      }>
      <TodaySummary onStorePress={() => router.navigate('/stores')} />
      <SalesTrend />
      <PaymentMix />
      {showHierarchyFilter ? <StoreRanking /> : null}
      <NoticeList onViewAll={() => openMenuItem('notices')} />
      <Row testID="home-help" alignment="center" onPress={() => openMenuItem('faq')} style={{ width: '100%', paddingVertical: spacing.sm }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.help')}
        </NativeText>
        <Spacer flexible />
      </Row>
      <NativeText variant="caption" tone="secondary">
        {t('home.sampleNotice')}
      </NativeText>
    </TabScreen>
  );
}
