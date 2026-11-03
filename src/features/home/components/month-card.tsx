import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';

/** This month's sales as one tappable row (label, figure, chevron), the same pattern as the next-payout row in the store card. */
export function MonthCard({ monthSales, onDetail }: { monthSales: number; onDetail: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();

  return (
    <HomeCard>
      <Row testID="home-month-detail" alignment="center" onPress={onDetail} style={{ width: '100%' }}>
        <Column spacing={2}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.monthSales')}
          </NativeText>
          <NativeText variant="title">{hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(monthSales) })}</NativeText>
        </Column>
        <Spacer flexible />
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
      </Row>
    </HomeCard>
  );
}
