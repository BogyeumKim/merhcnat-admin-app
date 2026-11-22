import { Icon } from '@expo/ui';
import { accessibilityAddTraits, accessibilityLabel, contentShape, font, shapes } from '@expo/ui/swift-ui/modifiers';

import { ICON_BUTTON_TARGET, type IconButtonProps } from './icon-button.types';

const BUTTON_TRAIT = accessibilityAddTraits(['isButton']);
/** 투명한 여백까지 누를 수 있게: 없으면 44pt frame 안에서도 글리프 픽셀만 탭에 반응한다. */
const HIT_AREA = contentShape(shapes.rectangle());
const TARGET = { width: ICON_BUTTON_TARGET, height: ICON_BUTTON_TARGET } as const;
const WEIGHTS = {
  regular: font({ weight: 'regular' }),
  medium: font({ weight: 'medium' }),
  semibold: font({ weight: 'semibold' }),
} as const;

/**
 * 아이콘 전용 버튼 (iOS). `@expo/ui` 58의 iOS `Icon`은 `accessibilityLabel` prop을 무시하므로(설치본 소스 확인)
 *  VoiceOver 라벨과 버튼 trait를 SwiftUI modifier로 준다. 44pt 고정 frame이 터치 영역이며 글리프는 가운데에 온다.
 */
export function IconButton({ icon, label, onPress, size = 24, color, weight, testID }: IconButtonProps) {
  const a11y = [HIT_AREA, accessibilityLabel(label), BUTTON_TRAIT];
  return (
    <Icon
      name={icon}
      size={size}
      color={color}
      onPress={onPress}
      testID={testID}
      modifiers={weight ? [WEIGHTS[weight], ...a11y] : a11y}
      style={TARGET}
    />
  );
}
