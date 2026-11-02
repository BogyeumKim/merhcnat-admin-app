import { NativeTabs } from 'expo-router/native-tabs';

import { useTranslation } from '@/shared/i18n';

import { TAB_ITEMS } from '../config/tabs';

/**
 * Tabs for both platforms. iOS adopts the system Liquid Glass tab bar when the app is built with the iOS 26+ SDK,
 * Android renders the Material 3 navigation bar. No background/indicator colors are set: overriding them removes the glass.
 */
export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      {TAB_ITEMS.map(({ name, labelKey, sf, md }) => (
        <NativeTabs.Trigger key={name} name={name}>
          <NativeTabs.Trigger.Label>{t(labelKey)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={sf} md={md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
