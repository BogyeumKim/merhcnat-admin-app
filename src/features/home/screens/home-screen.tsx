import { useTranslation } from '@/shared/i18n';
import { AppHeader } from '@/shared/ui/app-header';
import { icons } from '@/shared/ui/icons';
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
import { useHomeScreen } from '../hooks/use-home-screen';

/**
 * 홈 화면. `canvas` 배경 위에 흰 카드(`HomeCard`)를 쌓는다(토스·신한·트래블월렛 홈 패턴).
 * 순서: 매출 카드(오늘·이번 달, 기준 시각 새로고침, 금액 숨기기) → 결제 실패 행 → 선지급 배너(가능 계정만) → 최근 7일 막대 →
 * 최근 거래 → 내 가맹점 → 공지/혜택 → 고객센터 → 약관·버전. 서버가 보내지 않은 선택 블록은 그리지 않는다.
 * 수치는 `GET /api/home/summary`에서 가져오며, 동작은 `useHomeScreen`에 있다.
 */
export default function HomeScreen() {
  const { t } = useTranslation();
  const home = useHomeScreen();
  const { summary } = home;

  return (
    <TabScreen
      canvas
      header={
        <AppHeader
          title={summary?.storeName}
          actions={[{ icon: icons.notifications, label: t('home.notifications'), testID: 'home-notifications', onPress: home.openNotices }]}
        />
      }>
      {summary ? (
        <>
          <StoreCard
            summary={summary}
            updatedAt={home.updatedAt}
            refreshing={home.refreshing}
            onRefresh={home.refresh}
            onTransactions={home.openTransactions}
          />
          {summary.failedCount ? <FailedRow count={summary.failedCount} onPress={home.openFailedTransactions} /> : null}
          <PrepayBanner available={summary.prepayAvailable} />
          {summary.weeklySales?.length ? <WeekCard days={summary.weeklySales} /> : null}
          {summary.recentTransactions?.length ? <RecentCard items={summary.recentTransactions} onMore={home.openTransactions} /> : null}
          {summary.store ? <StoreInfoCard store={summary.store} onMore={home.openStores} /> : null}
        </>
      ) : (
        <SummaryStatus failed={home.failed} onRetry={home.retry} />
      )}
      <NoticeCard latestNoticeTitle={summary?.latestNotice?.title} />
      <SupportCard />
      <LegalFooter />
    </TabScreen>
  );
}
