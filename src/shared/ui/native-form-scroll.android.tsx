import { Column, ScrollView } from '@expo/ui';
import { imePadding, weight } from '@expo/ui/jetpack-compose/modifiers';

import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

const IME = [imePadding()];
/** Inside the column the scroll area takes the height the footer leaves. */
const FILL_COLUMN = [weight(1)];

/**
 * Scrollable form body drawn natively inside a `Host` (Android).
 * Keyboard: Compose's `imePadding()` shrinks the scroll area by the keyboard height, and Compose text fields bring
 * their cursor into view inside a scrolling parent. No JS keyboard listeners. With a `footer`, `imePadding()` is on
 * the whole column, so the footer rides above the keyboard.
 * `bottomInset` (navigation bar) is padding inside the content: the Host extends under the bar (edge-to-edge) and
 * `imePadding()` is zero while the keyboard is closed. While it is open the inset is counted twice, which only
 * adds some scrollable slack at the end of the content.
 */
export function NativeFormScroll({ children, bottomInset, footer }: NativeFormScrollProps) {
  if (!footer) {
    return (
      <ScrollView modifiers={IME}>
        <FormColumn bottomPadding={bottomInset + spacing.md}>{children}</FormColumn>
      </ScrollView>
    );
  }

  return (
    <Column modifiers={IME} style={{ width: '100%', height: '100%' }}>
      <ScrollView modifiers={FILL_COLUMN}>
        <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
      </ScrollView>
      <FormFooter bottomPadding={bottomInset + spacing.md}>{footer}</FormFooter>
    </Column>
  );
}
