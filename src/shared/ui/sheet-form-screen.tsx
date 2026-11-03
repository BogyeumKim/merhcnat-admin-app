import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/shared/theme';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/** Same form chrome as `BrandedFormScreen`, for a screen presented as a form sheet: no logo, no top safe area. The top padding keeps the title clear of the grabber and the rounded corners. */
export function SheetFormScreen({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: spacing.lg, paddingLeft: insets.left, paddingRight: insets.right }}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>{children}</NativeFormScroll>
      </NativeHost>
    </View>
  );
}
