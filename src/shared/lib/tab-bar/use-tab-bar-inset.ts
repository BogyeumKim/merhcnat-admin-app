import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BAR_HEIGHT, BOTTOM_MARGIN } from './floating-tab-bar';

/**
 * Bottom padding screens need so content isn't hidden behind the Android floating tab bar.
 * The bar is absolutely positioned, so the navigator reports no tab bar height for it.
 * iOS native tabs adjust content insets themselves, so this returns 0 there.
 */
export function useTabBarInset() {
  const { bottom } = useSafeAreaInsets();
  return process.env.EXPO_OS === 'android' ? BAR_HEIGHT + BOTTOM_MARGIN + bottom : 0;
}
