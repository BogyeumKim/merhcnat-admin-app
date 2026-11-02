import { HorizontalDivider } from '@expo/ui/jetpack-compose';

import { useNativeColors } from '@/shared/theme';

type FieldUnderlineProps = { invalid: boolean; focused: boolean };

/**
 * The line under a field (Android). A Material `HorizontalDivider`: the universal `Column` used on iOS has no children
 * here, and an empty Compose `Column` with only a fixed height + background drew nothing. Same states as iOS: 1dp at
 * rest (field border color, 3:1 against the page), 2dp when focused (text color) or invalid (danger color).
 */
export function FieldUnderline({ invalid, focused }: FieldUnderlineProps) {
  const colors = useNativeColors();
  const color = invalid ? colors.danger : focused ? colors.text : colors.fieldBorder;

  return <HorizontalDivider thickness={invalid || focused ? 2 : 1} color={color} />;
}
