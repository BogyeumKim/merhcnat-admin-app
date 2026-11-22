import { Column } from '@expo/ui';

import { LINK_TOUCH_PADDING, type LinkTextProps } from './link-text.types';
import { NativeText } from './native-text';

const TOUCH_TARGET = { paddingVertical: LINK_TOUCH_PADDING } as const;

/** 밑줄 텍스트 링크 (밑줄 없는 대체 구현. 실제 밑줄은 플랫폼 파일이 그린다). 44pt 높이 터치 영역. */
export function LinkText({ children, onPress, testID, tone = 'quiet', strong = false }: LinkTextProps) {
  return (
    <Column testID={testID} onPress={onPress} style={TOUCH_TARGET}>
      <NativeText variant="subhead" tone={strong || tone === 'strong' ? 'default' : 'secondary'}>
        {children}
      </NativeText>
    </Column>
  );
}
