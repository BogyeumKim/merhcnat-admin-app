import Visibility from '@expo/material-symbols/visibility.xml';
import VisibilityOff from '@expo/material-symbols/visibility_off.xml';
import { Column, Icon } from '@expo/ui';

import { useNativeColors } from '@/shared/theme';

import type { PasswordToggleProps } from './password-toggle.types';

/** Padding that brings the 24dp icon to a 44dp touch target. It sits on a wrapping `Column`, not on the `Icon`: the Android `Icon` with `onPress` is a `Box` of exactly `size`, so padding on it shrinks the glyph to a dot. */
const TOUCH_PADDING = 10;

/** Show/hide password icon (Android): Material Symbols from `@expo/material-symbols`, drawn by Compose. */
export function PasswordToggle({ revealed, label, onPress }: PasswordToggleProps) {
  const colors = useNativeColors();

  return (
    <Column onPress={onPress} testID="password-toggle" style={{ padding: TOUCH_PADDING }}>
      <Icon
        name={revealed ? VisibilityOff : Visibility}
        size={24}
        color={colors.secondaryText}
        accessibilityLabel={label}
      />
    </Column>
  );
}
