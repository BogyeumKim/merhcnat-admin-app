import { Column } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/** The rounded surface every home block sits on: an optional title, then the content. */
export function HomeCard({ title, width = '100%', children }: PropsWithChildren<{ title?: string; width?: '100%' | '49%' }>) {
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width, padding: spacing.lg, borderRadius: 24, backgroundColor: colors.field }}>
      {title ? (
        <NativeText variant="subhead" tone="secondary">
          {title}
        </NativeText>
      ) : null}
      {children}
    </Column>
  );
}
