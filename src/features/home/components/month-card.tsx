import CalendarMonth from '@expo/material-symbols/calendar_month.xml';

import { useTranslation } from '@/shared/i18n';

import { AmountRow } from './amount-row';
import { HomeCard } from './home-card';
import { formatAmount } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';

/** This month's sales: badge, label, figure and a "detail" button, the same row as today's sales in the store card. */
export function MonthCard({ monthSales, onDetail }: { monthSales: number; onDetail: () => void }) {
  const { t } = useTranslation();
  const hidden = useAmountsHidden();

  return (
    <HomeCard>
      <AmountRow
        icon={{ ios: 'calendar', android: CalendarMonth }}
        label={t('home.monthSales')}
        amount={hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(monthSales) })}
        action={t('home.detail')}
        onAction={onDetail}
        testID="home-month-detail"
      />
    </HomeCard>
  );
}
