import { Column } from '@expo/ui';
import { Text } from '@expo/ui/jetpack-compose';

import { useNativeColors } from '@/shared/theme';

import { LINK_TOUCH_PADDING, type LinkTextProps } from './link-text.types';

const TOUCH_TARGET = { paddingVertical: LINK_TOUCH_PADDING } as const;

const STYLE = { fontSize: 14, textDecoration: 'underline' } as const;
const STRONG_STYLE = { ...STYLE, fontWeight: '600' } as const;

/** 밑줄 텍스트 링크 (Android): `textDecoration`을 쓴 Compose `Text`, `sp` 크기, 44dp 높이 터치 영역. */
export function LinkText({ children, onPress, testID, tone = 'quiet', strong = false }: LinkTextProps) {
  const colors = useNativeColors();

  return (
    <Column testID={testID} onPress={onPress} style={TOUCH_TARGET}>
      <Text color={strong || tone === 'strong' ? colors.text : colors.secondaryText} style={strong ? STRONG_STYLE : STYLE}>
        {children}
      </Text>
    </Column>
  );
}
