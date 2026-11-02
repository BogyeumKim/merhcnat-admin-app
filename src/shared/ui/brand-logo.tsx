import { Image } from 'expo-image';

import { useNativeColors } from '@/shared/theme';

const LOGO = require('@/assets/images/korpay-logo.svg');
/** viewBox of `korpay-logo.svg` (168.6 x 56). Keep in sync with the file. */
const LOGO_ASPECT_RATIO = 168.6 / 56;

/**
 * Korpay wordmark (text only, like most login screens). The SVG is decoded natively by `expo-image` (cached, stays vector).
 * The K is filled with the brand red; the letters follow the theme through
 * `svgVariables` (SDK 58), so dark mode needs no second asset. To use another logo, replace `korpay-logo.svg` (or a PNG) and update `LOGO_ASPECT_RATIO`.
 */
export function BrandLogo({ height = 44 }: { height?: number }) {
  const { ink } = useNativeColors();

  return (
    <Image
      source={LOGO}
      svgVariables={{ '--korpay-ink': ink }}
      contentFit="contain"
      alt="Korpay"
      accessible
      style={{ height, aspectRatio: LOGO_ASPECT_RATIO, maxWidth: '100%' }}
    />
  );
}
