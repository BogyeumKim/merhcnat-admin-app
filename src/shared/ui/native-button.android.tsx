import { Button, OutlinedButton, Text, TextButton } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height, testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';

import { useNativeColors } from '@/shared/theme';

import type { NativeButtonProps } from './native-button.types';

/** 48dp: the Material minimum touch target, and about the height of the iOS button. */
const FULL_WIDTH = [fillMaxWidth(), height(48)];

/**
 * Material 3 button (Android) with the brand `action` color set explicitly. The universal `Button` takes its colors from
 * the Host's generated Material scheme, where a red seed gives a dusty brown primary instead of the brand red.
 * The disabled colors stay Material's own (gray container, 38% content).
 */
export function NativeButton({ label, onPress, variant = 'filled', disabled, testID, compact }: NativeButtonProps) {
  const colors = useNativeColors();
  const modifiers = [...(compact ? [] : FULL_WIDTH), ...(testID ? [testIDModifier(testID)] : [])];
  const common = { onClick: disabled ? undefined : onPress, enabled: !disabled, modifiers };
  const content = <Text>{label}</Text>;

  if (variant === 'outlined') {
    return (
      <OutlinedButton {...common} colors={{ contentColor: colors.action }}>
        {content}
      </OutlinedButton>
    );
  }
  if (variant === 'text') {
    return (
      <TextButton {...common} colors={{ contentColor: colors.action }}>
        {content}
      </TextButton>
    );
  }
  return (
    <Button {...common} colors={{ containerColor: colors.action, contentColor: colors.onAction }}>
      {content}
    </Button>
  );
}
