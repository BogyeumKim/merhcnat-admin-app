import { Column } from '@expo/ui';

import { radius, spacing, useNativeColors } from '@/shared/theme';

import { NativeText } from './native-text';

/**
 * Persistent, form-level error (for example "wrong ID or password"). It stays until the user acts, unlike a toast.
 * Bordered and tinted so it is recognizable without relying on text color alone.
 */
export function FormAlert({ message }: { message: string }) {
  const colors = useNativeColors();

  return (
    <Column
      style={{
        width: '100%',
        padding: spacing.md,
        backgroundColor: colors.dangerSurface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.danger,
      }}>
      <NativeText tone="danger">{message}</NativeText>
    </Column>
  );
}
