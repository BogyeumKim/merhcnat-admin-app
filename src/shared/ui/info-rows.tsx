import { Column, Row, Spacer } from '@expo/ui';

import { radius, spacing, useNativeColors } from '@/shared/theme';

import { NativeText } from './native-text';

type InfoRow = { label: string; value: string };

/** The quiet label/value card of the status screens (maintenance window, locked account): rows split by hairlines, values in bold. */
export function InfoRows({ rows }: { rows: readonly InfoRow[] }) {
  const colors = useNativeColors();

  return (
    <Column style={{ width: '100%', paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
      {rows.map((row, index) => (
        <Column key={row.label} style={{ width: '100%' }}>
          {index > 0 ? <Column style={{ width: '100%', height: 1, backgroundColor: colors.hairline }} /> : null}
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
