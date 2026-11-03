import { Button, Column, Text } from '@expo/ui';
import { buttonBorderShape, buttonStyle, font, frame, tint } from '@expo/ui/swift-ui/modifiers';

import { spacing, useNativeColors } from '@/shared/theme';

import type { NativeButtonProps } from './native-button.types';

/** Stretches the label to the width the button is offered; the button style then draws its background full width. */
const FILL_WIDTH = frame({ maxWidth: Infinity });
/** Pill, like the Korpay design's buttons (56pt tall, fully rounded). */
const SHAPE = buttonBorderShape('capsule');
/** Semibold 17pt label (follows Dynamic Type): the default regular weight reads thin inside a filled button. */
const LABEL = font({ textStyle: 'headline' });
/** 12pt: the button style adds about 11pt of its own, so a 17pt label ends up about 57pt tall (the design's 56). */
const LABEL_PADDING = spacing.sm + spacing.xs;
const TONAL_STYLE = buttonStyle('bordered');

/**
 * A plain SwiftUI button is only as tall as its label (about 22pt), below the 44pt minimum touch target. The padding
 * is placed INSIDE the label so it is part of the tappable area. The label has no `fontSize`/color: it follows
 * Dynamic Type and the tint.
 * The label is inside a SwiftUI `Button`, where a percentage width is not resolved (it would stay content-sized),
 * so the label fills the width with a SwiftUI flexible frame instead of `width: '100%'`.
 */
export function NativeButton({ label, onPress, variant = 'filled', disabled, testID, compact }: NativeButtonProps) {
  const colors = useNativeColors();
  const shapeModifiers = variant === 'text' ? undefined : variant === 'tonal' ? [SHAPE, TONAL_STYLE, tint(colors.ink)] : [SHAPE];

  return (
    <Button
      variant={variant === 'tonal' ? 'filled' : variant}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      modifiers={shapeModifiers}
      style={compact ? undefined : { width: '100%' }}>
      <Column
        alignment="center"
        modifiers={compact ? undefined : [FILL_WIDTH]}
        style={{ paddingVertical: compact ? spacing.sm : LABEL_PADDING, paddingHorizontal: compact ? spacing.sm : undefined }}>
        <Text modifiers={[LABEL]}>{label}</Text>
      </Column>
    </Button>
  );
}
