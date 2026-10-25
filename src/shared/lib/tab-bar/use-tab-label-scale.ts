import { useWindowDimensions } from 'react-native';

/**
 * The tab label keeps its size under large system text, like iOS tab bars (Apple: tab bars can't grow with
 * Dynamic Type) and the fixed-height bar here. `@expo/ui` Text sizes are `sp`, which Android scales, so divide
 * the design size by this factor. Text smaller than 1.0 still scales down. Android 14+ scales text
 * non-linearly, so the result is approximate rather than exact.
 */
export function useTabLabelScale() {
  const { fontScale } = useWindowDimensions();
  return Math.max(fontScale, 1);
}
