import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { FILL_ROW } from '@/shared/ui/fill-row';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount, formatWeekday } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';
import { summarizeWeek } from '../model/week-chart';

const CHART_HEIGHT = 96;
const BAR_GAP = spacing.sm;

/**
 * 최근 7일을 막대로 표시: 가장 많은 날(오늘 제외)은 진하게, 오늘은 아직 진행 중이라 옅은 톤 막대로, 그 아래 작은 통계 타일 두 개.
 * 막대·요일·타일 폭은 계산하지 않는다: 칸마다 `FILL_ROW` 래퍼를 둬 카드 콘텐츠 폭을 똑같이 나눈다(창 폭·여백 계산 없이 폼 시트·넓은 창에서도 맞음).
 * 색 칸은 래퍼 안에서 `width: '100%'`로 채운다(iOS는 배경이 유연 프레임보다 먼저 붙어 래퍼 자체에 줄 수 없다, `OtpBoxes`와 같은 방식).
 */
export function WeekCard({ days }: { days: NonNullable<HomeSummary['weeklySales']> }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const { total, average, peak, max } = summarizeWeek(days);
  const money = (value: number) => (hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(value) }));
  const tiles = [
    { key: 'peak', label: t('home.weekPeak', { day: peak ? formatWeekday(peak.date) : '-' }), value: money(peak?.amount ?? 0) },
    { key: 'average', label: t('home.weekAverage'), value: money(average) },
  ];

  return (
    <HomeCard>
      <Row alignment="center" style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.weekTitle')}</NativeText>
        <Spacer flexible />
        <NativeText variant="caption" tabular>
          {t('home.weekTotal', { amount: money(total) })}
        </NativeText>
      </Row>
      <Row alignment="end" spacing={BAR_GAP} style={{ width: '100%', height: CHART_HEIGHT, paddingTop: spacing.sm }}>
        {days.map((day, index) => {
          const isToday = index === days.length - 1;
          const isPeak = peak !== null && day.date === peak.date;
          return (
            <Column key={day.date} modifiers={FILL_ROW}>
              <Column
                style={{
                  width: '100%',
                  height: Math.max(6, Math.round((day.amount / max) * (CHART_HEIGHT - spacing.sm))),
                  borderRadius: radius.sm,
                  backgroundColor: isPeak ? colors.ink : isToday ? colors.tonal : colors.field,
                }}>
                {/* 자식 없는 Compose Column은 배경을 그리지 않는다(`.claude/rules/expo-ui.md`). */}
                <Spacer />
              </Column>
            </Column>
          );
        })}
      </Row>
      <Row spacing={BAR_GAP} style={{ width: '100%' }}>
        {days.map((day, index) => (
          <Column key={day.date} modifiers={FILL_ROW}>
            <Column alignment="center" style={{ width: '100%' }}>
              <NativeText variant="caption" tone="secondary" center>
                {index === days.length - 1 ? t('home.weekToday') : formatWeekday(day.date)}
              </NativeText>
            </Column>
          </Column>
        ))}
      </Row>
      <Row spacing={BAR_GAP} style={{ width: '100%', paddingTop: spacing.xs }}>
        {tiles.map((tile) => (
          <Column key={tile.key} modifiers={FILL_ROW}>
            <Column spacing={spacing.xxs} style={{ width: '100%', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.tonal }}>
              <NativeText variant="caption" tone="secondary">
                {tile.label}
              </NativeText>
              <NativeText variant="label" tabular selectable>
                {tile.value}
              </NativeText>
            </Column>
          </Column>
        ))}
      </Row>
    </HomeCard>
  );
}
