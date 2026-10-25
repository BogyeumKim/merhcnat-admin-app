import { ScrollView } from '@expo/ui';
import { imePadding } from '@expo/ui/jetpack-compose/modifiers';
import type { PropsWithChildren } from 'react';

import { useKeyboardVisible } from '@/shared/lib/keyboard';
import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';

/**
 * Scrollable form body drawn natively inside a `Host` (Android).
 * Keyboard: Compose's `imePadding()` shrinks the scroll area by the keyboard height, and Compose text fields bring
 * their cursor into view inside a scrolling parent. The IME inset already covers the navigation bar, so the
 * `bottomInset` padding inside the content (the Host extends under the bar, edge-to-edge) is only added while the
 * keyboard is closed; open, it would be counted twice. Works for gesture and 3-button navigation alike.
 */
export function NativeFormScroll({ children, bottomInset }: PropsWithChildren<{ bottomInset: number }>) {
  const keyboardVisible = useKeyboardVisible();

  return (
    <ScrollView modifiers={[imePadding()]}>
      <FormColumn bottomPadding={(keyboardVisible ? 0 : bottomInset) + spacing.md}>{children}</FormColumn>
    </ScrollView>
  );
}
