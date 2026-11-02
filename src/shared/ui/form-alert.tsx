import ErrorIcon from '@expo/material-symbols/error.xml';
import { Icon, Row } from '@expo/ui';

import { spacing, useNativeColors } from '@/shared/theme';

import { NativeText } from './native-text';

/** The icon and the message size together, so the symbol sits on the first text line. */
const ICON_SIZE = 18;

/**
 * Persistent, form-level error (for example "wrong ID or password"). It stays until the user acts, unlike a toast.
 * Deliberately not a box: a small icon plus the message in the danger color. The icon and the words carry the meaning,
 * so it does not rely on color alone.
 */
export function FormAlert({ message }: { message: string }) {
  const colors = useNativeColors();

  return (
    <Row alignment="start" spacing={spacing.sm} style={{ width: '100%', paddingVertical: spacing.xs }}>
      <Icon name={{ ios: 'exclamationmark.circle.fill', android: ErrorIcon }} size={ICON_SIZE} color={colors.danger} />
      <NativeText variant="subhead" tone="danger">
        {message}
      </NativeText>
    </Row>
  );
}
