import { Text } from '@expo/ui';
import { accessibilityAddTraits, font, monospacedDigit, textSelection } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import { TONE_COLOR } from './native-text-tone';
import type { NativeTextProps } from './native-text.types';

/** SwiftUI 텍스트 스타일은 사용자의 Dynamic Type 설정(접근성 크기 포함)에 따라 커진다. */
const textStyles = {
  largeTitle: font({ textStyle: 'title', weight: 'bold' }),
  title: font({ textStyle: 'title2', weight: 'bold' }),
  headline: font({ textStyle: 'headline' }),
  label: font({ textStyle: 'subheadline', weight: 'semibold' }),
  fieldLabel: font({ textStyle: 'footnote', weight: 'bold' }),
  body: font({ textStyle: 'body' }),
  subhead: font({ textStyle: 'subheadline' }),
  caption: font({ textStyle: 'caption' }),
} as const;

const headerTrait = accessibilityAddTraits(['isHeader']);
const selectableText = textSelection(true);
const tabularDigits = monospacedDigit();

export function NativeText({ children, variant = 'body', tone = 'default', center, selectable, tabular }: NativeTextProps) {
  const colors = useNativeColors();
  const color = TONE_COLOR[tone](colors);
  const isHeader = variant === 'title' || variant === 'largeTitle';
  const modifiers = [
    textStyles[variant],
    ...(isHeader ? [headerTrait] : []),
    ...(tabular ? [tabularDigits] : []),
    ...(selectable ? [selectableText] : []),
  ];

  return (
    <Text modifiers={modifiers} textStyle={{ color, textAlign: center ? 'center' : 'left' }}>
      {children}
    </Text>
  );
}
