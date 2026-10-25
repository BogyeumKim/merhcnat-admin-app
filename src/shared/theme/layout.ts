import { useWindowDimensions } from 'react-native';

/**
 * Width breakpoints in dp, following the Material window size classes (compact < 600, medium < 840,
 * expanded). Layout reacts to the *window*, never to device names, so foldables, tablets, split screen
 * and iOS resizable windows all work the same way.
 */
export const BREAKPOINTS = { medium: 600, expanded: 840 } as const;

export type WidthClass = 'compact' | 'medium' | 'expanded';

export function useWindowLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  const widthClass: WidthClass =
    width >= BREAKPOINTS.expanded ? 'expanded' : width >= BREAKPOINTS.medium ? 'medium' : 'compact';
  const isLandscape = width > height;
  /** Brand pane next to the content: wide windows in landscape, or any expanded-width window. */
  const isTwoPane = widthClass === 'expanded' || (widthClass === 'medium' && isLandscape);
  /** Very little vertical room (phone landscape, split screen): shrink decorative elements. */
  const isShort = height < 520;

  return { width, height, fontScale, widthClass, isLandscape, isTwoPane, isShort };
}
