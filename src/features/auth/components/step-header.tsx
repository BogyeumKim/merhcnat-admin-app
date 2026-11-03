import ShieldLock from '@expo/material-symbols/shield_lock.xml';
import { Column, type Icon } from '@expo/ui';
import type { ComponentProps } from 'react';

import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';

import { StepBars } from './step-bars';

type IconName = ComponentProps<typeof Icon>['name'];

/**
 * Top of a verification step: optional progress bars, an optional icon badge, a title and one line of explanation.
 * Without `icon` it is the plain sheet header of the design (bars, two-line title, quiet body).
 */
export function StepHeader({
  title,
  body,
  icon,
  step,
}: {
  title: string;
  body: string;
  icon?: IconName | 'shield';
  step?: { current: number; total: number };
}) {
  const resolved: IconName | undefined = icon === 'shield' ? { ios: 'lock.shield', android: ShieldLock } : icon;

  if (!resolved) {
    return (
      <Column spacing={spacing.sm} style={{ width: '100%' }}>
        {step ? <StepBars current={step.current} total={step.total} /> : null}
        <NativeText variant="title">{title}</NativeText>
        <NativeText tone="secondary">{body}</NativeText>
      </Column>
    );
  }
  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      {step ? <StepBars current={step.current} total={step.total} /> : null}
      <StatusHeader icon={resolved} title={title} body={body} />
    </Column>
  );
}
