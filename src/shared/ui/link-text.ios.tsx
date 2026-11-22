import { Column, Text } from '@expo/ui';
import { font, underline } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import { LINK_TOUCH_PADDING, type LinkTextProps } from './link-text.types';

const TOUCH_TARGET = { paddingVertical: LINK_TOUCH_PADDING } as const;

const SUBHEAD = font({ textStyle: 'subheadline' });
const UNDERLINE = underline({ isActive: true, pattern: 'solid' });

/** 밑줄 텍스트 링크 (iOS): SwiftUI `underline`, Dynamic Type 크기, 44pt 높이 터치 영역. */
export function LinkText({ children, onPress, testID, tone = 'quiet' }: LinkTextProps) {
  const colors = useNativeColors();

  return (
    <Column testID={testID} onPress={onPress} style={TOUCH_TARGET}>
      <Text modifiers={[SUBHEAD, UNDERLINE]} textStyle={{ color: tone === 'strong' ? colors.text : colors.secondaryText }}>
        {children}
      </Text>
    </Column>
  );
}
