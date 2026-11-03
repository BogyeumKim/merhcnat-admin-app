import { Column } from '@expo/ui';
import { Text } from '@expo/ui/jetpack-compose';

import { spacing, useNativeColors } from '@/shared/theme';

import type { LinkTextProps } from './link-text.types';

const STYLE = { fontSize: 14, textDecoration: 'underline' } as const;

/** Underlined text link (Android): Compose `Text` with `textDecoration`, `sp` size, a 44dp-high touch target. */
export function LinkText({ children, onPress, testID, tone = 'quiet' }: LinkTextProps) {
  const colors = useNativeColors();

  return (
    <Column testID={testID} onPress={onPress} style={{ paddingVertical: spacing.sm }}>
      <Text color={tone === 'strong' ? colors.text : colors.secondaryText} style={STYLE}>
        {children}
      </Text>
    </Column>
  );
}
