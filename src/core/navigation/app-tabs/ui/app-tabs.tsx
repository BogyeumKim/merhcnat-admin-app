import { NativeTabs } from 'expo-router/native-tabs';

import { useTranslation } from '@/shared/i18n';

import { TAB_ITEMS } from '../config/tabs';

/**
 * iOS (and default) tabs. Native tabs adopt the system Liquid Glass tab bar when the app is built
 * with the iOS 26+ SDK, so no background/indicator colors are set — overriding them removes the glass.
 */
export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      {TAB_ITEMS.map(({ name, labelKey, sf }) => (
        <NativeTabs.Trigger key={name} name={name}>
          <NativeTabs.Trigger.Label>{t(labelKey)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={sf} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
