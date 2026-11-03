import { Column, Icon, Spacer } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';

import { NativeText } from './native-text';

type IconName = ComponentProps<typeof Icon>['name'];

const BADGE = 56;
const ICON = 28;

/**
 * Top of a step or a status screen: a round icon badge, a bold two-line title and one line of explanation (the layout of
 * the Korpay design: lock, wrench, download, shield screens all share it). The glyph is the ink color, never red. The badge
 * is a fixed square with the icon centered by flexible spacers, so a tall or wide glyph (lock, wrench) never stretches it into an oval.
 */
export function StatusHeader({ icon, title, body, children }: { icon?: IconName; title: string; body?: string; children?: ReactNode }) {
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      {icon ? (
        <Column alignment="center" style={{ width: BADGE, height: BADGE, borderRadius: BADGE / 2, backgroundColor: colors.tonal }}>
          <Spacer flexible />
          <Icon name={icon} size={ICON} color={colors.ink} />
          <Spacer flexible />
        </Column>
      ) : null}
      {children}
      <NativeText variant="title">{title}</NativeText>
      {body ? <NativeText tone="secondary">{body}</NativeText> : null}
    </Column>
  );
}
