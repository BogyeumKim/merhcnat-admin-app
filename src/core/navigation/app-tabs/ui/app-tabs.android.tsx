import { Tabs } from 'expo-router/js-tabs';

import { useTranslation } from '@/shared/i18n';

import { AndroidFloatingTabBar } from './android-floating-tab-bar';
import { TAB_ITEMS } from '../config/tabs';

/** Android tabs: JS tabs navigator with a rounded Jetpack Compose bar floating above the content. */
export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AndroidFloatingTabBar {...props} />}>
      {TAB_ITEMS.map(({ name, labelKey }) => (
        <Tabs.Screen key={name} name={name} options={{ title: t(labelKey) }} />
      ))}
    </Tabs>
  );
}
