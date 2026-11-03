import type { PropsWithChildren, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandedLayout } from './branded-layout';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

type BrandedFormScreenProps = PropsWithChildren<{
  /** Pinned under the scrolling form, above the keyboard (the primary action). `@expo/ui` elements. */
  footer?: ReactNode;
  /** Show the brand tagline under the logo. */
  tagline?: boolean;
  /** `@expo/ui` content at the very bottom of the screen, under the scroll (for example the notice card and the app version). */
  bottomNote?: ReactNode;
}>;

/**
 * A pre-login form screen: responsive brand layout + one native (SwiftUI/Compose) scrolling Host.
 * Children and `footer` must be `@expo/ui` components. The native scroll view handles the keyboard and large system text.
 */
export function BrandedFormScreen({ children, footer, tagline, bottomNote }: BrandedFormScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <BrandedLayout tagline={tagline} bottomNote={bottomNote}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>
          {children}
        </NativeFormScroll>
      </NativeHost>
    </BrandedLayout>
  );
}
