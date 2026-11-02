import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/** Same form chrome as `BrandedFormScreen`, for a screen presented as a form sheet: no logo, no top safe area. */
export function SheetFormScreen({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingLeft: insets.left, paddingRight: insets.right }}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>{children}</NativeFormScroll>
      </NativeHost>
    </View>
  );
}
