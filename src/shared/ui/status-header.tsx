import { Column, Icon } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';

import { NativeText } from './native-text';

type IconName = ComponentProps<typeof Icon>['name'];

const BADGE = 56;
const ICON = 28;

/**
 * Top of a step or a status screen: a round icon badge, a bold two-line title and one line of explanation (the layout of
 * the Korpay design: lock, wrench, download, shield screens all share it). The glyph is the ink color, never red. The badge
 * is the icon plus equal padding (a fixed-size Icon inside a Column was not centered on Android).
 */
export function StatusHeader({ icon, title, body, children }: { icon?: IconName; title: string; body?: string; children?: ReactNode }) {
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      {icon ? (
        <Column style={{ padding: (BADGE - ICON) / 2, borderRadius: BADGE / 2, backgroundColor: colors.tonal }}>
          <Icon name={icon} size={ICON} color={colors.ink} />
        </Column>
      ) : null}
      {children}
      <NativeText variant="title">{title}</NativeText>
      {body ? <NativeText tone="secondary">{body}</NativeText> : null}
    </Column>
  );
}
