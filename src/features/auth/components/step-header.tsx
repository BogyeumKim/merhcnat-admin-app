import ShieldLock from '@expo/material-symbols/shield_lock.xml';
import { Column, Icon } from '@expo/ui';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

const BADGE = 56;
const ICON = 28;

/**
 * Top of every verification step: a quiet icon badge, a title and one line of explanation. The badge uses the field
 * color (not a brand-colored block), so the step reads as part of the form, not as an alert.
 */
export function StepHeader({ title, body }: { title: string; body: string }) {
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      {/* The badge is the icon plus equal padding on every side (a fixed-size Icon inside a Column was not centered on Android). */}
      <Column style={{ padding: (BADGE - ICON) / 2, borderRadius: BADGE / 2, backgroundColor: colors.field }}>
        <Icon name={{ ios: 'lock.shield', android: ShieldLock }} size={ICON} color={colors.action} />
      </Column>
      <NativeText variant="title">{title}</NativeText>
      <NativeText tone="secondary">{body}</NativeText>
    </Column>
  );
}
