import { Column } from '@expo/ui';

import { useNativeColors } from '@/shared/theme';

type FieldUnderlineProps = { invalid: boolean; focused: boolean };

/**
 * The line under a field (the field has no box). 1pt at rest in the field border color (3:1 against the page), 2pt
 * when focused (text color) or invalid (danger color), so the state is not carried by color alone.
 */
export function FieldUnderline({ invalid, focused }: FieldUnderlineProps) {
  const colors = useNativeColors();
  const color = invalid ? colors.danger : focused ? colors.text : colors.fieldBorder;

  return <Column style={{ width: '100%', height: invalid || focused ? 2 : 1, backgroundColor: color }} />;
}
