import { Column } from '@expo/ui';

import { spacing } from '@/shared/theme';

import type { LinkTextProps } from './link-text.types';
import { NativeText } from './native-text';

/** Underlined text link (fallback without the underline; the platform files draw it). A 44pt-high touch target. */
export function LinkText({ children, onPress, testID, tone = 'quiet' }: LinkTextProps) {
  return (
    <Column testID={testID} onPress={onPress} style={{ paddingVertical: spacing.sm }}>
      <NativeText variant="subhead" tone={tone === 'strong' ? 'default' : 'secondary'}>
        {children}
      </NativeText>
    </Column>
  );
}
