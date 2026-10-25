import { ScrollView } from '@expo/ui';
import { scrollDismissesKeyboard } from '@expo/ui/swift-ui/modifiers';
import type { PropsWithChildren } from 'react';

import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';

/**
 * Scrollable form body drawn natively inside a `Host` (iOS).
 * Keyboard: a SwiftUI `ScrollView` respects the keyboard safe area (the Host does not set `ignoreSafeArea`), and
 * `scrollDismissesKeyboard` (iOS 16+) lets the user drag the keyboard away.
 * The home-indicator inset is applied by SwiftUI itself, so `bottomInset` is unused here.
 */
export function NativeFormScroll({ children }: PropsWithChildren<{ bottomInset: number }>) {
  return (
    <ScrollView modifiers={[scrollDismissesKeyboard('interactively')]}>
      <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
    </ScrollView>
  );
}
