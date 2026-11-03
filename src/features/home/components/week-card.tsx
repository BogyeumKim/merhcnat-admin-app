import { Column, Row, Spacer } from '@expo/ui';
import { useWindowDimensions } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount, formatWeekday } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';
import { summarizeWeek } from '../model/week-chart';

const CHART_HEIGHT = 96;
const BAR_GAP = spacing.sm;
/** Page padding (`FormColumn`) plus the card padding on both sides: what the bars row is narrower than the window. */
const SIDE_SPACE = 2 * spacing.md + 2 * spacing.lg;

/** Last 7 days as bars: the busiest day in ink, today as a pale outlined bar (it is still running), then two small stat tiles. */
export function WeekCard({ days }: { days: NonNullable<HomeSummary['weeklySales']> }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const { width } = useWindowDimensions();
  const { total, average, peak, max } = summarizeWeek(days);
  const tileWidth = Math.floor((width - SIDE_SPACE - BAR_GAP) / 2);
  const barWidth = Math.floor((width - SIDE_SPACE - BAR_GAP * (days.length - 1)) / days.length);
  const money = (value: number) => (hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(value) }));

  return (
    <HomeCard>
      <Row alignment="center" style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.weekTitle')}</NativeText>
        <Spacer flexible />
        <NativeText variant="caption">{t('home.weekTotal', { amount: money(total) })}</NativeText>
      </Row>
      <Row alignment="end" spacing={BAR_GAP} style={{ width: '100%', height: CHART_HEIGHT, paddingTop: spacing.sm }}>
        {days.map((day, index) => {
          const isToday = index === days.length - 1;
          const isPeak = peak !== null && day.date === peak.date;
          return (
            <Column
              key={day.date}
              style={{
                width: barWidth,
                height: Math.max(6, Math.round((day.amount / max) * (CHART_HEIGHT - spacing.sm))),
                borderRadius: radius.sm,
                backgroundColor: isPeak ? colors.ink : isToday ? colors.tonal : colors.field,
              }}
            />
          );
        })}
      </Row>
      <Row spacing={BAR_GAP} style={{ width: '100%' }}>
        {days.map((day, index) => (
          <Column key={day.date} style={{ width: barWidth }}>
            <NativeText variant="caption" tone="secondary" center>
              {index === days.length - 1 ? t('home.weekToday') : formatWeekday(day.date)}
            </NativeText>
          </Column>
        ))}
      </Row>
      <Row spacing={spacing.sm} style={{ width: '100%', paddingTop: spacing.xs }}>
        <Column spacing={2} style={{ width: tileWidth, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.tonal }}>
          <NativeText variant="caption" tone="secondary">
            {t('home.weekPeak', { day: peak ? formatWeekday(peak.date) : '-' })}
          </NativeText>
          <NativeText variant="label">{money(peak?.amount ?? 0)}</NativeText>
        </Column>
        <Column spacing={2} style={{ width: tileWidth, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.tonal }}>
          <NativeText variant="caption" tone="secondary">
            {t('home.weekAverage')}
          </NativeText>
          <NativeText variant="label">{money(average)}</NativeText>
        </Column>
      </Row>
    </HomeCard>
  );
}
