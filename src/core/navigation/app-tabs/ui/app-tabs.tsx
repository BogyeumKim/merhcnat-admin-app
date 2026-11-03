import { NativeTabs } from 'expo-router/native-tabs';

import { useTranslation } from '@/shared/i18n';
import { useNativeColors } from '@/shared/theme';

import { TAB_ITEMS } from '../config/tabs';

/**
 * Tabs for both platforms. iOS adopts the system Liquid Glass tab bar when the app is built with the iOS 26+ SDK, so
 * **no color is passed on iOS** (overriding them removes the glass). Android renders the Material 3 navigation bar, which
 * on its own takes a lavender tint from the generated palette: it gets the same white surface as the home cards, the ink color
 * for the selected tab (the Korpay design: dark selected, gray others), gray for the others and no pill, like the tab bars of Toss, Shinhan and Travel Wallet.
 */
export default function AppTabs() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const androidColors =
    process.env.EXPO_OS === 'android'
      ? {
          backgroundColor: colors.card,
          indicatorColor: 'transparent',
          labelVisibilityMode: 'labeled' as const,
          iconColor: { default: colors.secondaryText, selected: colors.ink },
          labelStyle: { default: { color: colors.secondaryText }, selected: { color: colors.ink } },
        }
      : {};

  return (
    <NativeTabs minimizeBehavior="onScrollDown" {...androidColors}>
      {TAB_ITEMS.map(({ name, labelKey, sf, md }) => (
        <NativeTabs.Trigger key={name} name={name}>
          <NativeTabs.Trigger.Label>{t(labelKey)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={sf} md={md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
