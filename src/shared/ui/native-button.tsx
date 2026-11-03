import { Button } from '@expo/ui';

import type { NativeButtonProps } from './native-button.types';

/** Full-width button. Material buttons already guarantee a 48dp touch target, so Android needs no extra padding. */
export function NativeButton({ label, onPress, variant = 'filled', disabled, testID, compact }: NativeButtonProps) {
  return (
    <Button
      label={label}
      variant={variant === 'tonal' ? 'filled' : variant}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={compact ? undefined : { width: '100%' }}
    />
  );
}
