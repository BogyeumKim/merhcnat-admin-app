import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';


/** One line card, like "11월에 쓴 돈  [내역]" in the reference apps: this month's sales and a button to the details. */
export function MonthCard({ monthSales, onDetail }: { monthSales: number; onDetail: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();

  return (
    <HomeCard>
      <Row alignment="center" style={{ width: '100%' }}>
        <Column spacing={2}>
          <NativeText variant="headline">{hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(monthSales) })}</NativeText>
          <NativeText variant="subhead" tone="secondary">
            {t('home.monthSales')}
          </NativeText>
        </Column>
        <Spacer flexible />
        <Column
          testID="home-month-detail"
          onPress={onDetail}
          style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.tonal }}>
          <NativeText variant="subhead">{t('home.detail')}</NativeText>
        </Column>
      </Row>
    </HomeCard>
  );
}
