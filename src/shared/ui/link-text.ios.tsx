import { Column, Text } from '@expo/ui';
import { font, underline } from '@expo/ui/swift-ui/modifiers';

import { spacing, useNativeColors } from '@/shared/theme';

import type { LinkTextProps } from './link-text.types';

const SUBHEAD = font({ textStyle: 'subheadline' });
const UNDERLINE = underline({ isActive: true, pattern: 'solid' });

/** Underlined text link (iOS): SwiftUI `underline`, Dynamic Type size, a 44pt-high touch target. */
export function LinkText({ children, onPress, testID, tone = 'quiet' }: LinkTextProps) {
  const colors = useNativeColors();

  return (
    <Column testID={testID} onPress={onPress} style={{ paddingVertical: spacing.sm }}>
      <Text modifiers={[SUBHEAD, UNDERLINE]} textStyle={{ color: tone === 'strong' ? colors.text : colors.secondaryText }}>
        {children}
      </Text>
    </Column>
  );
}
