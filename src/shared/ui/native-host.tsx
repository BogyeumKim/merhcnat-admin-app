import { Host } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { useNativeColors } from '@/shared/theme';

/**
 * Project defaults for an `@expo/ui` `Host`: follows the app color scheme, takes the action color as the
 * native tint/Material seed, and either fills its parent (scrolling screens) or wraps its content height.
 * `matchContents` can only be set once on mount, so `fill` must not change after the first render.
 */
export function NativeHost({ children, fill = false }: PropsWithChildren<{ fill?: boolean }>) {
  const { scheme, action } = useNativeColors();

  return (
    <Host
      colorScheme={scheme}
      seedColor={action}
      matchContents={fill ? undefined : { vertical: true }}
      style={fill ? { flex: 1 } : { alignSelf: 'stretch' }}>
      {children}
    </Host>
  );
}
