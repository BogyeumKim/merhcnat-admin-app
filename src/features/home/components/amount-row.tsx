import { Column, Icon, Row, Spacer } from '@expo/ui';
import type { ComponentProps } from 'react';

import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

type IconName = ComponentProps<typeof Icon>['name'];

const BADGE_ICON = 26;
const BADGE_PADDING = spacing.sm + spacing.xs / 2;

/** Tonal circle with a glyph: the leading badge of a row. The padding sits on the `Column` (see `.claude/rules/expo-ui.md`). */
export function IconBadge({ icon }: { icon: IconName }) {
  const colors = useNativeColors();

  return (
    <Column style={{ padding: BADGE_PADDING, borderRadius: (BADGE_ICON + 2 * BADGE_PADDING) / 2, backgroundColor: colors.tonal }}>
      <Icon name={icon} size={BADGE_ICON} color={colors.ink} />
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
  note,
  large = false,
  action,
  onAction,
  testID,
}: {
  icon: IconName;
  label: string;
  amount: string;
  note?: string;
  /** The hero figure (today's sales) is set larger; other rows keep the headline size so long amounts stay on one line. */
  large?: boolean;
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
        <NativeText variant={large ? 'title' : 'headline'}>{amount}</NativeText>
        {note ? (
          <NativeText variant="caption" tone="secondary">
            {note}
          </NativeText>
        ) : null}
      </Column>
      <Spacer flexible />
      <Column
        testID={testID}
        onPress={onAction}
        style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.tonal }}>
        <NativeText variant="subhead">{action}</NativeText>
      </Column>
    </Row>
  );
}
