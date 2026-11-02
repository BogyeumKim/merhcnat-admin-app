import type { PropsWithChildren, ReactNode } from 'react';

export type NativeFormScrollProps = PropsWithChildren<{
  /** Bottom safe-area/navigation-bar inset in dp (used on Android; iOS applies its own). */
  bottomInset: number;
  /** Pinned under the scrolling content, above the keyboard (for example the primary button). `@expo/ui` elements. */
  footer?: ReactNode;
}>;
