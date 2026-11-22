import { Icon } from '@expo/ui';

import type { DecorativeIconProps } from './decorative-icon.types';

/**
 * 장식용 아이콘 (Android, 기본). 옆 문구가 뜻을 전하는 아이콘(상태 배지, 화살표, 셰브런)에 쓴다.
 *  `accessibilityLabel`을 주지 않으면 Compose `contentDescription`이 null이라 TalkBack이 건너뛴다.
 *  아이콘만 있는 버튼은 `IconButton`을 쓴다.
 */
export function DecorativeIcon({ name, size, color }: DecorativeIconProps) {
  return <Icon name={name} size={size} color={color} />;
}
