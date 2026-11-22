import { accessibilityAddTraits, accessibilityElement, accessibilityLabel } from '@expo/ui/swift-ui/modifiers';

import type { PressableA11yModifiers } from './pressable-a11y';

/**
 * iOS: `onPress`는 SwiftUI 탭 제스처일 뿐이라 VoiceOver가 안쪽 텍스트를 따로따로 읽고 버튼임을 알리지 않는다.
 * 자식을 한 요소로 합치고(`combine`) 버튼 trait를 더한다.
 */
const BUTTON = [accessibilityElement('combine'), accessibilityAddTraits(['isButton'])];

export function pressableA11y(label?: string): PressableA11yModifiers {
  return label ? [...BUTTON, accessibilityLabel(label)] : BUTTON;
}
