import { Column, Icon, Row, Spacer } from '@expo/ui';
import type { ComponentProps } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

type IconName = ComponentProps<typeof Icon>['name'];

/** Tonal circle with a glyph: the leading badge of a row. The padding sits on the `Column` (see `.claude/rules/expo-ui.md`). */
export function IconBadge({ icon }: { icon: IconName }) {
  const colors = useNativeColors();

  return (
    <Column style={{ padding: 10, borderRadius: 22, backgroundColor: colors.tonal }}>
      <Icon name={icon} size={24} color={colors.action} />
    </Column>
  );
}

/**
 * One figure row: badge, small label (with a note), the amount in bold, and a small tonal action button on the right
 * (the "송금 / 이체 / 내역" button of the reference apps).
 */
export function AmountRow({
  icon,
  label,
  amount,
  action,
  onAction,
  testID,
}: {
  icon: IconName;
  label: string;
  amount: string;
  action: string;
  onAction: () => void;
  testID: string;
}) {
  const colors = useNativeColors();

  return (
    <Row alignment="center" spacing={spacing.md} style={{ width: '100%', paddingVertical: spacing.xs }}>
      <IconBadge icon={icon} />
      <Column spacing={2}>
        <NativeText variant="subhead" tone="secondary">
          {label}
        </NativeText>
        <NativeText variant="headline">{amount}</NativeText>
      </Column>
      <Spacer flexible />
      <Column
        testID={testID}
        onPress={onAction}
        style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 12, backgroundColor: colors.tonal }}>
        <NativeText variant="subhead">{action}</NativeText>
      </Column>
    </Row>
  );
}
