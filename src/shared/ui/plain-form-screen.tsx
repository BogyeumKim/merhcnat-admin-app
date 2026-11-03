import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/** A full-screen form without the brand header (a screen in the stack, not a sheet): status-bar inset on top, the footer pinned above the keyboard. */
export function PlainFormScreen({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>
          {children}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
