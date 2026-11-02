import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, useNativeColors } from '@/shared/theme';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/**
 * Body of a tab screen: one native (SwiftUI/Compose) scrolling Host, like the pre-login screens.
 * `canvas` paints the tinted page background that white cards sit on (home). `header` is an optional RN node above the scroll (the top bar). Children must be `@expo/ui` components. The status bar inset is padding of the wrapping view. Both tab bars sit in the
 * normal layout flow (iOS native tabs, Android Compose NavigationBar), so no bottom inset is needed here.
 */
export function TabScreen({ children, header, canvas = false }: PropsWithChildren<{ header?: ReactNode; canvas?: boolean }>) {
  const insets = useSafeAreaInsets();
  const native = useNativeColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: canvas ? native.canvas : colors.background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {header}
      <NativeHost fill>
        <NativeFormScroll bottomInset={0}>{children}</NativeFormScroll>
      </NativeHost>
    </View>
  );
}
