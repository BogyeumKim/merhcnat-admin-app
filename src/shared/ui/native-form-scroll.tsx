import { ScrollView } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';

/**
 * Platform-neutral fallback (tooling and unknown platforms). The real implementations are
 * `native-form-scroll.android.tsx` (Compose `imePadding()`) and `native-form-scroll.ios.tsx` (SwiftUI).
 */
export function NativeFormScroll({ children }: PropsWithChildren<{ bottomInset: number }>) {
  return (
    <ScrollView>
      <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
    </ScrollView>
  );
}
