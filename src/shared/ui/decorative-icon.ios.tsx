import { Icon } from '@expo/ui';
import { accessibilityHidden } from '@expo/ui/swift-ui/modifiers';

import type { DecorativeIconProps } from './decorative-icon.types';

/** SwiftUI는 SF Symbol 이름으로 라벨을 자동으로 붙여 VoiceOver가 "끝", "오른쪽" 같은 말을 읽으므로 트리에서 뺀다. */
const HIDDEN = [accessibilityHidden(true)];

/** 장식용 아이콘 (iOS). 옆 문구가 뜻을 전하는 아이콘에 쓴다. 아이콘만 있는 버튼은 `IconButton`. */
export function DecorativeIcon({ name, size, color }: DecorativeIconProps) {
  return <Icon name={name} size={size} color={color} modifiers={HIDDEN} />;
}
