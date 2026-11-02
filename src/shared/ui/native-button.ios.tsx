import { Button, Column, Text } from '@expo/ui';
import { buttonBorderShape, font, frame } from '@expo/ui/swift-ui/modifiers';

import { radius, spacing } from '@/shared/theme';

import type { NativeButtonProps } from './native-button.types';

/** Stretches the label to the width the button is offered; the button style then draws its background full width. */
const FILL_WIDTH = frame({ maxWidth: Infinity });
/** Rounded rectangle instead of the default capsule: closer to the form fields. */
const SHAPE = buttonBorderShape('roundedRectangle', radius.md);
/** Semibold 17pt label (follows Dynamic Type): the default regular weight reads thin inside a filled button. */
const LABEL = font({ textStyle: 'headline' });
/** 8pt: the button style adds about 11pt of its own, so a 17pt label ends up about 49pt tall (touch target >= 44pt). */
const LABEL_PADDING = spacing.sm;

/**
 * A plain SwiftUI button is only as tall as its label (about 22pt), below the 44pt minimum touch target. The padding
 * is placed INSIDE the label so it is part of the tappable area. The label has no `fontSize`/color: it follows
 * Dynamic Type and the tint.
 * The label is inside a SwiftUI `Button`, where a percentage width is not resolved (it would stay content-sized),
 * so the label fills the width with a SwiftUI flexible frame instead of `width: '100%'`.
 */
export function NativeButton({ label, onPress, variant = 'filled', disabled, testID, compact }: NativeButtonProps) {
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      modifiers={variant === 'text' ? undefined : [SHAPE]}
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
