import { Column, Icon } from '@expo/ui';

import { ICON_BUTTON_TARGET, type IconButtonProps } from './icon-button.types';

/**
 * 아이콘 전용 버튼 (Android, 기본). 44 터치 영역은 감싸는 `Column`의 패딩으로 만든다:
 *  `onPress`가 있는 Android `Icon`은 정확히 `size`인 `Box`라 패딩을 주면 글리프가 점으로 줄어든다.
 *  TalkBack은 `accessibilityLabel`(Compose `contentDescription`)을 읽는다.
 */
export function IconButton({ icon, label, onPress, size = 24, color, testID }: IconButtonProps) {
  return (
    <Column testID={testID} onPress={onPress} style={{ padding: (ICON_BUTTON_TARGET - size) / 2 }}>
      <Icon name={icon} size={size} color={color} accessibilityLabel={label} />
    </Column>
  );
}
