import NotificationsIcon from '@expo/material-symbols/notifications.xml';
import { router } from 'expo-router';

import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { AppHeader } from '@/shared/ui/app-header';
import { TabScreen } from '@/shared/ui/tab-screen';

import { FailedRow } from '../components/failed-row';
import { LegalFooter } from '../components/legal-footer';
import { NoticeCard } from '../components/notice-card';
import { PrepayBanner } from '../components/prepay-banner';
import { RecentCard } from '../components/recent-card';
import { StoreCard } from '../components/store-card';
import { StoreInfoCard } from '../components/store-info-card';
import { SummaryStatus } from '../components/summary-status';
import { SupportCard } from '../components/support-card';
import { WeekCard } from '../components/week-card';
import { useHomeSummaryData } from '../queries/use-home-summary-data';

/**
 * Home, built like the home screens of Toss, Shinhan and Travel Wallet: white cards on a tinted page, each with a bold
 * title, figures with a small tonal button, and no charts. Order: store (today's sales, next payout), the month, a
 * promo card (advance payout, for accounts that may request it), notices and FAQ. Everything else is in the Menu tab. The figures come from
 * `GET /api/home/summary`.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { data: summary, isError, refetch, dataUpdatedAt } = useHomeSummaryData();

  return (
    <TabScreen
      canvas
      header={
        <AppHeader
          title={summary?.storeName}
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
      {summary ? (
        <>
          <StoreCard
            summary={summary}
            updatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            onTransactions={() => router.navigate('/transactions')}
          />
          {summary.failedCount ? <FailedRow count={summary.failedCount} onPress={() => openMenuItem('failedTransactions')} /> : null}
          <PrepayBanner available={summary.prepayAvailable} />
          {summary.weeklySales?.length ? <WeekCard days={summary.weeklySales} /> : null}
          {summary.recentTransactions?.length ? (
            <RecentCard items={summary.recentTransactions} onMore={() => router.navigate('/transactions')} />
          ) : null}
          {summary.store ? <StoreInfoCard store={summary.store} onMore={() => router.navigate('/stores')} /> : null}
        </>
      ) : (
        <SummaryStatus failed={isError} onRetry={() => void refetch()} />
      )}
      <NoticeCard latestNoticeTitle={summary?.latestNotice?.title} />
      <SupportCard />
      <LegalFooter />
    </TabScreen>
  );
}
