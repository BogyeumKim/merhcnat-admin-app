import CheckBox from '@expo/material-symbols/check_box.xml';
import CheckBoxOutline from '@expo/material-symbols/check_box_outline_blank.xml';
import { Icon, Row } from '@expo/ui';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

type Props = { value: boolean; onValueChange: (value: boolean) => void; label: string; testID?: string };

/**
 * A checkbox with its label ("아이디 저장"). The universal `Checkbox` is a switch on iOS (SwiftUI has no checkbox), so this
 * draws the box with a symbol (SF Symbol on iOS, Material Symbol on Android) and the whole row is the touch target.
 */
export function RememberCheckbox({ value, onValueChange, label, testID }: Props) {
  const colors = useNativeColors();

  return (
    <Row
      testID={testID}
      alignment="center"
      spacing={spacing.sm}
      onPress={() => onValueChange(!value)}
      style={{ paddingVertical: spacing.sm }}>
      <Icon
        name={value ? { ios: 'checkmark.square.fill', android: CheckBox } : { ios: 'square', android: CheckBoxOutline }}
        size={24}
        color={value ? colors.text : colors.secondaryText}
        accessibilityLabel={label}
      />
      <NativeText variant="subhead">{label}</NativeText>
    </Row>
  );
}
