import { Icon } from '@expo/ui';
import { accessibilityAddTraits, accessibilityLabel, font } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import { icons } from './icons';
import type { PasswordToggleProps } from './password-toggle.types';

/**
 * 44pt 고정 정사각형 (최소 터치 영역이기도 함). `eye`와 `eye.slash`는 높이가 달라, 고정 frame이 없으면
 *  토글할 때마다 행 높이가 늘었다 줄었다 했다.
 */
const BOX = 44;
const BUTTON_TRAIT = accessibilityAddTraits(['isButton']);
/** 가벼운 심볼 굵기가 1pt 밑줄과 어울리며, 기본 굵기는 주변보다 무거워 보인다. */
const LIGHT = font({ weight: 'light' });

/** 비밀번호 표시/숨김 아이콘 (iOS): SF Symbols. 범용 iOS `Icon`에는 접근성 prop이 없어 라벨을 modifier로 지정한다. */
export function PasswordToggle({ revealed, label, onPress }: PasswordToggleProps) {
  const colors = useNativeColors();

  return (
    <Icon
      name={revealed ? icons.passwordHide : icons.passwordShow}
      size={22}
      color={colors.secondaryText}
      onPress={onPress}
      testID="password-toggle"
      modifiers={[LIGHT, accessibilityLabel(label), BUTTON_TRAIT]}
      style={{ width: BOX, height: BOX }}
    />
  );
}
