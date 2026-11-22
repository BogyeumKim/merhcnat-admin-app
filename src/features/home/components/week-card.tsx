import { Column, Row, Spacer } from '@expo/ui';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { CONTENT_MAX_WIDTH, radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount, formatWeekday } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';
import { summarizeWeek } from '../model/week-chart';

const CHART_HEIGHT = 96;
const BAR_GAP = spacing.sm;
/** 페이지 좌우 패딩(`FormColumn`, lg)과 카드 좌우 패딩(`HomeCard`, lg)의 합: 막대 행이 콘텐츠 컬럼보다 좁은 만큼. */
const SIDE_SPACE = 2 * spacing.lg + 2 * spacing.lg;

/** 막대 행의 실제 폭. 콘텐츠 컬럼은 넓은 창(펼친 폴더블·태블릿)에서 `CONTENT_MAX_WIDTH`로 줄어들므로 창 폭이 아니라 그 폭 기준이다. */
function useChartWidth() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return Math.min(width - insets.left - insets.right, CONTENT_MAX_WIDTH) - SIDE_SPACE;
}

/** 최근 7일을 막대로 표시: 가장 많은 날(오늘 제외)은 진하게, 오늘은 아직 진행 중이라 옅은 톤 막대로, 그 아래 작은 통계 타일 두 개. */
export function WeekCard({ days }: { days: NonNullable<HomeSummary['weeklySales']> }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const chartWidth = useChartWidth();
  const { total, average, peak, max } = summarizeWeek(days);
  const tileWidth = Math.floor((chartWidth - BAR_GAP) / 2);
  const barWidth = Math.floor((chartWidth - BAR_GAP * (days.length - 1)) / days.length);
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
              }}>
              {/* 자식 없는 Compose Column은 배경을 그리지 않는다(`.claude/rules/expo-ui.md`). */}
              <Spacer />
            </Column>
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
