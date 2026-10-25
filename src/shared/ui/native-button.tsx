import { Button } from '@expo/ui';

import type { NativeButtonProps } from './native-button.types';


/** Full-width button. Material buttons already guarantee a 48dp touch target, so Android needs no extra padding. */
export function NativeButton({ label, onPress, variant = 'filled', disabled }: NativeButtonProps) {
  return <Button label={label} variant={variant} disabled={disabled} onPress={onPress} style={{ width: '100%' }} />;
}
