import { Column, Icon, Row, Spacer } from '@expo/ui';
import type { ComponentProps } from 'react';

import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

type IconName = ComponentProps<typeof Icon>['name'];

const BADGE_ICON = 26;
const BADGE_PADDING = spacing.sm + spacing.xs / 2;

/** 글리프가 들어간 톤 원형 배지: 행의 맨 앞 요소. 패딩은 `Column`에 둔다(`.claude/rules/expo-ui.md` 참고). */
export function IconBadge({ icon }: { icon: IconName }) {
  const colors = useNativeColors();

  return (
    <Column style={{ padding: BADGE_PADDING, borderRadius: (BADGE_ICON + 2 * BADGE_PADDING) / 2, backgroundColor: colors.tonal }}>
      <Icon name={icon} size={BADGE_ICON} color={colors.ink} />
    </Column>
  );
}

/**
 * 수치 한 행: 배지, 작은 라벨(설명 포함), 굵은 금액, 오른쪽의 작은 톤 액션 버튼
 * (참고 앱의 "송금 / 이체 / 내역" 버튼).
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
  /** 핵심 수치(오늘 매출)는 더 크게 표시한다. 다른 행은 headline 크기를 유지해 긴 금액도 한 줄에 들어간다. */
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
