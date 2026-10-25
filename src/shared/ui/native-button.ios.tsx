import { Button, Column, Text } from '@expo/ui';

import { spacing } from '@/shared/theme';

import type { NativeButtonProps } from './native-button.types';

/**
 * A plain SwiftUI button is only as tall as its label (about 22pt), below the 44pt minimum touch target. The padding
 * is placed INSIDE the label so it is part of the tappable area. The label has no `fontSize`/color: it follows
 * Dynamic Type and the tint.
 */
export function NativeButton({ label, onPress, variant = 'filled', disabled }: NativeButtonProps) {
  return (
    <Button variant={variant} disabled={disabled} onPress={onPress} style={{ width: '100%' }}>
      <Column alignment="center" style={{ width: '100%', paddingVertical: spacing.sm }}>
        <Text>{label}</Text>
      </Column>
    </Button>
  );
}
