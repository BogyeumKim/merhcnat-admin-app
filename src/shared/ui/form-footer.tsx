import { Column } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { spacing } from '@/shared/theme';

/** Container of the pinned bottom action: the same horizontal margin as the form, with room above and below. */
export function FormFooter({ children, bottomPadding }: PropsWithChildren<{ bottomPadding: number }>) {
  return (
    <Column
      spacing={spacing.sm}
      style={{
        width: '100%',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: bottomPadding,
      }}>
      {children}
    </Column>
  );
}
