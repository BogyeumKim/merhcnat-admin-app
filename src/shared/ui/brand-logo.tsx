import { Image } from 'expo-image';

import { useNativeColors } from '@/shared/theme';

const LOGO = require('@/assets/images/korpay-logo.svg');
/** viewBox of `korpay-logo.svg` (376 x 88). Keep in sync with the file. */
const LOGO_ASPECT_RATIO = 376 / 88;

/**
 * Korpay logo. The SVG is decoded natively by `expo-image` (cached, stays vector) and themed through
 * `svgVariables` (SDK 58), so dark mode needs no second asset.
 */
export function BrandLogo({ height = 56 }: { height?: number }) {
  const { ink, brand } = useNativeColors();

  return (
    <Image
      source={LOGO}
      svgVariables={{ '--korpay-ink': ink, '--korpay-brand': brand }}
      contentFit="contain"
      alt="Korpay"
      accessible
      style={{ height, aspectRatio: LOGO_ASPECT_RATIO, maxWidth: '100%' }}
    />
  );
}
