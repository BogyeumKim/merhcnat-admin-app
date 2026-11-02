import { Column } from '@expo/ui';
import { ScrollView } from '@expo/ui/swift-ui';
import { scrollDismissesKeyboard } from '@expo/ui/swift-ui/modifiers';

import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

/**
 * Scrollable form body drawn natively inside a `Host` (iOS).
 * Uses the SwiftUI `ScrollView` directly, not the universal one: in `@expo/ui` 58.0.23 the universal iOS `ScrollView`
 * wraps its children in a plain SwiftUI `VStack`, which turns percentage sizes off for everything below it, so every
 * `width: '100%'` collapses to the content width. The SwiftUI `ScrollView` resolves child percentages against the viewport.
 * Keyboard: a SwiftUI `ScrollView` respects the keyboard safe area (the Host does not set `ignoreSafeArea`), and
 * `scrollDismissesKeyboard` (iOS 16+) lets the user drag the keyboard away. With a `footer`, the whole column
 * shrinks above the keyboard, so the footer stays visible.
 * The home-indicator inset is applied by SwiftUI itself, so `bottomInset` is unused here.
 */
export function NativeFormScroll({ children, footer }: NativeFormScrollProps) {
  const scroll = (
    <ScrollView modifiers={[scrollDismissesKeyboard('interactively')]}>
      <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
    </ScrollView>
  );

  if (!footer) return scroll;

  return (
    <Column style={{ width: '100%', height: '100%' }}>
      {scroll}
      <FormFooter bottomPadding={spacing.md}>{footer}</FormFooter>
    </Column>
  );
}
