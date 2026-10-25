import { Text } from '@expo/ui';
import { accessibilityAddTraits, font } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import type { NativeTextProps } from './native-text.types';

/** SwiftUI text styles scale with the user's Dynamic Type setting (including the accessibility sizes). */
const textStyles = {
  title: font({ textStyle: 'title2', weight: 'bold' }),
  headline: font({ textStyle: 'headline' }),
  body: font({ textStyle: 'body' }),
  subhead: font({ textStyle: 'subheadline' }),
  caption: font({ textStyle: 'caption' }),
} as const;

const headerTrait = accessibilityAddTraits(['isHeader']);

export function NativeText({ children, variant = 'body', tone = 'default', center }: NativeTextProps) {
  const colors = useNativeColors();
  const color = tone === 'danger' ? colors.danger : tone === 'secondary' ? colors.secondaryText : colors.text;

  return (
    <Text
      modifiers={variant === 'title' ? [textStyles[variant], headerTrait] : [textStyles[variant]]}
      textStyle={{ color, textAlign: center ? 'center' : 'left' }}>
      {children}
    </Text>
  );
}
