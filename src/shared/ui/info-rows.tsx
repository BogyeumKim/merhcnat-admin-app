import { Column, Row, Spacer } from '@expo/ui';

import { radius, spacing, useNativeColors } from '@/shared/theme';

import { Divider } from './divider';
import { NativeText } from './native-text';

type InfoRow = { label: string; value: string };

/** 상태 화면(점검 시간, 잠긴 계정)의 차분한 라벨/값 카드: 행은 헤어라인으로 나누고 값은 굵게. */
export function InfoRows({ rows }: { rows: readonly InfoRow[] }) {
  const colors = useNativeColors();

  return (
    <Column style={{ width: '100%', paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
      {rows.map((row, index) => (
        <Column key={row.label} style={{ width: '100%' }}>
          {index > 0 ? <Divider color={colors.hairline} /> : null}
          <Row alignment="center" style={{ width: '100%', paddingVertical: spacing.md - 2 }}>
            <NativeText variant="subhead" tone="secondary">
              {row.label}
            </NativeText>
            <Spacer flexible />
            <NativeText variant="label">{row.value}</NativeText>
          </Row>
        </Column>
      ))}
    </Column>
  );
}
