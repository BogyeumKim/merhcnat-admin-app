import type { PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandedLayout } from './branded-layout';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/**
 * A pre-login form screen: responsive brand layout + one native (SwiftUI/Compose) scrolling Host.
 * Children must be `@expo/ui` components. The native scroll view handles the keyboard and large system text.
 */
export function BrandedFormScreen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <BrandedLayout>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom}>{children}</NativeFormScroll>
      </NativeHost>
    </BrandedLayout>
  );
}
