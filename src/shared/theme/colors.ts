import { Color } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';

/**
 * Semantic, platform-native colors for React Native views. They resolve on-device and follow light/dark
 * automatically. They are opaque objects, so they cannot be passed to `@expo/ui` style props — use
 * `useNativeColors()` (hex strings) for those.
 */
export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: '#000000',
  }),
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: '#3c3c43',
  }),
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: '#c6c6c8',
  }),
  background: Platform.select({
    ios: Color.ios.systemBackground,
    android: Color.android.dynamic.surface,
    default: '#ffffff',
  }),
  danger: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: '#ff3b30',
  }),
};

/**
 * Hex palette for `@expo/ui` props and brand tokens. Brand red comes from the legacy app (`mainColor: #ff003a`).
 * That red is only 3.95:1 against white, so it is used for the LOGO and other graphics, while text/buttons use `action`,
 * a darker/lighter step of the same hue. WCAG 2.x contrast, computed:
 * - light: action #E10033 = 4.94 on white and with a white label; text #191E28 = 16.7; secondary #5A6472 = 6.0 (5.4 on the
 *   field); danger #B42318 = 6.57 (6.05 on its surface); border #8A94A6 = 3.06.
 * - dark: action #E51E43 = 4.60 on black and 4.57 with a white label (one value serves both the filled and the text
 *   button, so it sits in the narrow window where both pass); text 19.4; secondary 10.05; danger #FF8A80 = 9.2;
 *   border #6B7690 = 4.62 on black.
 * Limits: `action` text on the `field` fill is 4.47 (just under 4.5), so action-colored text never sits on a field. The field
 * border is 2.77 against the field fill; the 3:1 boundary is the outer edge against the page (3.06 / 4.62).
 * Brand red and error red are close in hue (danger vs action: 1.33:1 light, 2.0:1 dark): errors are never shown as colored text alone (bordered, tinted `FormAlert`,
 * field border, message text).
 */
const palettes = {
  light: Object.freeze({
    scheme: 'light',
    brand: '#ff003a',
    action: '#E10033',
    ink: '#2D3640',
    text: '#191E28',
    secondaryText: '#5A6472',
    danger: '#B42318',
    dangerSurface: '#FEF3F2',
    field: '#F1F4F6',
    fieldBorder: '#8A94A6',
  }),
  dark: Object.freeze({
    scheme: 'dark',
    brand: '#ff003a',
    action: '#E51E43',
    ink: '#F2F6FF',
    text: '#F2F6FF',
    secondaryText: '#A9B4C8',
    danger: '#FF8A80',
    dangerSurface: '#2A1512',
    field: '#1D2433',
    fieldBorder: '#6B7690',
  }),
} as const;

/**
 * Hex colors for `@expo/ui` style props (which need plain strings) and brand tokens.
 * Hook-only: it reads the color scheme at render time. The returned objects are shared constants.
 */
export function useNativeColors() {
  return palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
