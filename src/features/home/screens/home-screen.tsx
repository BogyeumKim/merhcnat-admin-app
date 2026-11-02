import NotificationsIcon from '@expo/material-symbols/notifications.xml';
import { router } from 'expo-router';

import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { AppHeader } from '@/shared/ui/app-header';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { MonthCard } from '../components/month-card';
import { NoticeBanner } from '../components/notice-banner';
import { ShortcutGrid } from '../components/shortcut-grid';
import { StoreCard } from '../components/store-card';

/**
 * Home, built like the home screens of Toss, Shinhan and Travel Wallet: white cards on a tinted page, each with a bold
 * title, figures with a small tonal button, and no charts. Order: store (today's sales, next payout), the month, an
 * icon grid of the entries the account uses, the latest notice. Everything else is in the Menu tab. Numbers are sample
 * data until the server (or the WebView) provides them.
 */
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <TabScreen
      canvas
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
      <StoreCard
        onStore={() => router.navigate('/stores')}
        onTransactions={() => router.navigate('/transactions')}
        onDeposits={() => openMenuItem('deposits')}
      />
      <MonthCard onDetail={() => router.navigate('/transactions')} />
      <ShortcutGrid />
      <NoticeBanner onPress={() => openMenuItem('notices')} />
      <NativeText variant="caption" tone="secondary">
        {t('home.sampleNotice')}
      </NativeText>
    </TabScreen>
  );
}
