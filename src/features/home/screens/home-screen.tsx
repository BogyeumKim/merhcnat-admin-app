import NotificationsIcon from '@expo/material-symbols/notifications.xml';
import { router } from 'expo-router';

import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { AppHeader } from '@/shared/ui/app-header';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { NoticeBanner } from '../components/notice-banner';
import { TodaySummary } from '../components/today-summary';

/**
 * Home: the brand bar (logo, notifications), the store and today's sales, one notice card. Everything else
 * lives under the Menu tab's categories. Numbers are sample data until the server (or the WebView) provides them.
 */
export default function HomeScreen() {
  const { t } = useTranslation();

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
      <NoticeBanner onPress={() => openMenuItem('notices')} />
      <NativeText variant="caption" tone="secondary">
        {t('home.sampleNotice')}
      </NativeText>
    </TabScreen>
  );
}
