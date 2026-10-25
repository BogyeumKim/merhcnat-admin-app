import { Text, type TextProps } from 'react-native';

import { colors, type, type TypeVariant } from '@/shared/theme';

type AppTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: 'default' | 'secondary' | 'danger';
};

const toneColor = {
  default: colors.label,
  secondary: colors.secondaryLabel,
  danger: colors.danger,
} as const;

/**
 * Themed React Native `Text`. Used instead of `@expo/ui` `Text` for copy because RN text follows the system
 * font size on both platforms and wraps instead of clipping. (`@expo/ui` `Text` with an explicit `fontSize`
 * is fixed-size on iOS.)
 */
export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  return <Text style={[type[variant], { color: toneColor[tone] }, style]} {...props} />;
}
