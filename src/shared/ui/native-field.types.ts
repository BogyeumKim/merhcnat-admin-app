import type { TextInputProps } from '@expo/ui';
import type { ReactElement } from 'react';

export type NativeFieldProps = TextInputProps & {
  /** Marks an error state with a thicker danger underline (not color alone). */
  invalid?: boolean;
  /** Accessible name of the field. The visible label is a separate element, and a field may have no placeholder. */
  accessibilityLabel?: string;
  /** A control at the end of the field (for example show/hide password). An `@expo/ui` element. */
  trailing?: ReactElement;
};
