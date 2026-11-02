import { Icon } from '@expo/ui';
import { accessibilityAddTraits, accessibilityLabel, font } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import type { PasswordToggleProps } from './password-toggle.types';

/**
 * Fixed 44pt square (also the minimum touch target). `eye` and `eye.slash` have different heights, so without a fixed
 * frame the row got taller or shorter on every toggle.
 */
const BOX = 44;
const BUTTON_TRAIT = accessibilityAddTraits(['isButton']);
/** A light symbol weight matches the 1pt underlines; the default weight reads heavier than everything around it. */
const LIGHT = font({ weight: 'light' });

/** Show/hide password icon (iOS): SF Symbols. The universal iOS `Icon` has no accessibility prop, so the label is a modifier. */
export function PasswordToggle({ revealed, label, onPress }: PasswordToggleProps) {
  const colors = useNativeColors();

  return (
    <Icon
      name={revealed ? 'eye.slash' : 'eye'}
      size={22}
      color={colors.secondaryText}
      onPress={onPress}
      testID="password-toggle"
      modifiers={[LIGHT, accessibilityLabel(label), BUTTON_TRAIT]}
      style={{ width: BOX, height: BOX }}
    />
  );
}
