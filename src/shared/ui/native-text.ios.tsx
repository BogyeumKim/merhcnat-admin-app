import { Text } from '@expo/ui';
import { accessibilityAddTraits, font } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import { TONE_COLOR } from './native-text-tone';
import type { NativeTextProps } from './native-text.types';

/** SwiftUI text styles scale with the user's Dynamic Type setting (including the accessibility sizes). */
const textStyles = {
  largeTitle: font({ textStyle: 'title', weight: 'bold' }),
  title: font({ textStyle: 'title2', weight: 'bold' }),
  headline: font({ textStyle: 'headline' }),
  label: font({ textStyle: 'subheadline', weight: 'semibold' }),
  body: font({ textStyle: 'body' }),
  subhead: font({ textStyle: 'subheadline' }),
  caption: font({ textStyle: 'caption' }),
} as const;

const headerTrait = accessibilityAddTraits(['isHeader']);

export function NativeText({ children, variant = 'body', tone = 'default', center }: NativeTextProps) {
  const colors = useNativeColors();
  const color = TONE_COLOR[tone](colors);

  return (
    <Text
      modifiers={variant === 'title' || variant === 'largeTitle' ? [textStyles[variant], headerTrait] : [textStyles[variant]]}
      textStyle={{ color, textAlign: center ? 'center' : 'left' }}>
      {children}
    </Text>
  );
}
