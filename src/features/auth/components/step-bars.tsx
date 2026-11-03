import { Column, Row, Spacer } from '@expo/ui';
import { useWindowDimensions } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

const BAR_HEIGHT = 4;
const BAR_GAP = 4;
/** Room the step label ("1 / 2단계") and the gap to it take on the right. */
const LABEL_RESERVE = 78;

/**
 * "1 / 2단계": the bars fill the width the label leaves (two equal bars, finished ones in the action color), like the
 * Korpay design. Widths are computed from the window because `@expo/ui` rows have no flexible children.
 * `reserve` is extra width taken by buttons on either side (the code step's back and close buttons).
 */
export function StepBars({ current, total, reserve = 0 }: { current: number; total: number; reserve?: number }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { width } = useWindowDimensions();
  const barsWidth = width - 2 * spacing.lg - LABEL_RESERVE - reserve;
  const barWidth = Math.max(16, Math.floor((barsWidth - BAR_GAP * (total - 1)) / total));

  return (
    <Row alignment="center" spacing={spacing.sm}>
      <Row alignment="center" spacing={BAR_GAP}>
        {Array.from({ length: total }, (_, index) => (
          <Column
            key={index}
            style={{
              width: barWidth,
              height: BAR_HEIGHT,
              borderRadius: radius.sm / 4,
              backgroundColor: index < current ? colors.action : colors.hairline,
            }}
          />
        ))}
      </Row>
      <Spacer flexible />
      <NativeText variant="caption" tone="secondary">
        {t('auth.verify.step', { current, total })}
      </NativeText>
    </Row>
  );
}
