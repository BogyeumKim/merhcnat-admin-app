import type { PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/shared/lib/tab-bar';
import { colors, spacing } from '@/shared/theme';

/**
 * Scrolling body for a tab screen. iOS native tabs and the system inset behavior handle the safe areas
 * (`contentInsetAdjustmentBehavior`); on Android the status bar and the floating tab bar are added as padding.
 */
export function TabScreen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const isAndroid = process.env.EXPO_OS === 'android';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        gap: spacing.md,
        padding: spacing.md,
        paddingTop: spacing.lg + (isAndroid ? insets.top : 0),
        paddingBottom: spacing.md + tabBarInset,
      }}>
      {children}
    </ScrollView>
  );
}
