import { Column, Row, Spacer } from '@expo/ui';

import { radius, spacing, useNativeColors, useWindowLayout } from '@/shared/theme';

import { Divider } from './divider';
import { NativeText } from './native-text';
import type { NativeTextTone } from './native-text.types';

/** `tone`: 값 글자 색(강조가 필요한 값). 기본은 본문색. */
type InfoRow = { label: string; value: string; tone?: NativeTextTone };

/**
 * 상태 화면(점검 시간, 잠긴 계정)의 차분한 라벨/값 카드: 행은 헤어라인으로 나누고 값은 굵게.
 *  손쉬운 사용 글꼴(`isLargeText`)에서는 라벨 아래에 값을 쌓는다: 나란히 두면 Android에서 라벨이 폭을 먼저 차지해
 *  값이 몇 글자 폭으로 눌려 단어 중간에서 끊겼다(Pixel 글꼴 2.0 + 최대 화면 크기 실측).
 */
export function InfoRows({ rows }: { rows: readonly InfoRow[] }) {
  const colors = useNativeColors();
  const { isLargeText } = useWindowLayout();

  return (
    <Column style={{ width: '100%', paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
      {rows.map((row, index) => (
        <Column key={row.label} style={{ width: '100%' }}>
          {index > 0 ? <Divider color={colors.hairline} /> : null}
          {isLargeText ? (
            <Column alignment="start" spacing={spacing.xxs} style={{ width: '100%', paddingVertical: spacing.md - spacing.xxs }}>
              <NativeText variant="subhead" tone="secondary">
                {row.label}
              </NativeText>
              <NativeText variant="label" tone={row.tone}>
                {row.value}
              </NativeText>
            </Column>
          ) : (
            // spacing: 라벨과 값이 붙지 않게(Android Row는 기본 간격 0). Spacer 양옆이라 최소 8.
            <Row alignment="center" spacing={spacing.xs} style={{ width: '100%', paddingVertical: spacing.md - spacing.xxs }}>
              <NativeText variant="subhead" tone="secondary">
                {row.label}
              </NativeText>
              <Spacer flexible />
              <NativeText variant="label" tone={row.tone}>
                {row.value}
              </NativeText>
            </Row>
          )}
        </Column>
      ))}
    </Column>
  );
}
