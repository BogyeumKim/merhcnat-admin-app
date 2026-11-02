import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatWeekday } from '../model/format';
import { SAMPLE_WEEK } from '../model/sample-summary';

const BAR_MAX_HEIGHT = 96;
const BAR_WIDTH = 28;

/** Last seven days as bars (today highlighted). A bar is a `Column` holding a `Spacer`: a childless Compose `Column` draws nothing. */
export function SalesTrend() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const peak = Math.max(...SAMPLE_WEEK.map((day) => day.amount));

  return (
    <HomeCard title={t('home.weekTrend')}>
      <Row alignment="end" style={{ width: '100%' }}>
        {SAMPLE_WEEK.map((day, index) => {
          const isToday = index === SAMPLE_WEEK.length - 1;
          return (
            <Column key={day.date} spacing={spacing.xs} style={{ width: `${100 / SAMPLE_WEEK.length}%` }}>
              <Spacer flexible />
              <Column
                style={{
                  width: BAR_WIDTH,
                  borderRadius: 8,
                  backgroundColor: isToday ? colors.action : colors.fieldBorder,
                }}>
                <Spacer size={Math.max(8, Math.round((day.amount / peak) * BAR_MAX_HEIGHT))} />
              </Column>
              <NativeText variant="caption" tone="secondary">
                {formatWeekday(day.date)}
              </NativeText>
            </Column>
          );
        })}
      </Row>
    </HomeCard>
  );
}
