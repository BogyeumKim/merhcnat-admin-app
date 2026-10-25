import { Column } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { spacing } from '@/shared/theme';

/**
 * The form's content column. Its padding lives INSIDE the native scroll view on purpose: padding on the scroll
 * view itself would sit outside the scrolling area and clip the content instead of scrolling to the edge.
 */
export function FormColumn({ children, bottomPadding }: PropsWithChildren<{ bottomPadding: number }>) {
  return (
    <Column
      spacing={spacing.md}
      style={{
        width: '100%',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: bottomPadding,
      }}>
      {children}
    </Column>
  );
}
