import ShieldLock from '@expo/material-symbols/shield_lock.xml';
import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';

const BAR_WIDTH = 56;
const BAR_HEIGHT = 4;

/** "1 / 2단계": two short bars (the finished ones in the action color) and the step count, above the title. */
function StepProgress({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Row alignment="center" spacing={spacing.xs} style={{ width: '100%', paddingBottom: spacing.sm }}>
      {Array.from({ length: total }, (_, index) => (
        <Column
          key={index}
          style={{
            width: BAR_WIDTH,
            height: BAR_HEIGHT,
            borderRadius: radius.sm,
            backgroundColor: index < current ? colors.action : colors.tonal,
          }}
        />
      ))}
      <Spacer flexible />
      <NativeText variant="caption" tone="secondary">
        {t('auth.verify.step', { current, total })}
      </NativeText>
    </Row>
  );
}

/**
 * Top of every verification step: optional progress bars, an optional icon badge, a title and one line of explanation.
 */
export function StepHeader({
  title,
  body,
  badge = true,
  step,
}: {
  title: string;
  body: string;
  badge?: boolean;
  step?: { current: number; total: number };
}) {
  return (
    <StatusHeader icon={badge ? { ios: 'lock.shield', android: ShieldLock } : undefined} title={title} body={body}>
      {step ? <StepProgress current={step.current} total={step.total} /> : null}
    </StatusHeader>
  );
}
