import Event from '@expo/material-symbols/event.xml';
import CreditScore from '@expo/material-symbols/payments.xml';
import Refresh from '@expo/material-symbols/refresh.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { AmountRow } from './amount-row';
import { HomeCard } from './home-card';
import { formatAmount, formatClock, formatMonthDay } from '../model/format';
import { useAmountsHidden, useSetAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';

type Props = {
  summary: HomeSummary;
  /** When the figures were fetched (ms). Shown as "as of 14:32" with a refresh button, like the reference apps. */
  updatedAt: number;
  onRefresh: () => void;
  onStore: () => void;
  onTransactions: () => void;
  onDeposits: () => void;
};

/**
 * The store card: store name (to the Stores tab), today's sales and the next payout as figure rows with a small button
 * each, the approval/cancellation counts, and a footer with the as-of time (refresh) and "hide amounts".
 */
export function StoreCard({ summary, updatedAt, onRefresh, onStore, onTransactions, onDeposits }: Props) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const setHidden = useSetAmountsHidden();
  const { nextDepositAmount, nextDepositDate } = summary;
  const money = (value: number) => (hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(value) }));

  return (
    <HomeCard title={summary.storeName} onTitlePress={onStore} testID="home-store">
      <AmountRow
        testID="home-sales-detail"
        icon={{ ios: 'wonsign.circle.fill', android: CreditScore }}
        label={t('home.todaySales')}
        amount={money(summary.todaySales)}
        action={t('home.detail')}
        onAction={onTransactions}
      />
      <AmountRow
        testID="home-deposit-detail"
        icon={{ ios: 'calendar', android: Event }}
        label={nextDepositDate ? `${t('home.nextDeposit')} · ${formatMonthDay(nextDepositDate)}` : t('home.nextDeposit')}
        amount={nextDepositAmount == null ? t('home.noDeposit') : money(nextDepositAmount)}
        action={t('home.lookUp')}
        onAction={onDeposits}
      />
      <NativeText variant="subhead" tone="secondary">
        {t('home.counts', { approvals: summary.approvalCount, cancellations: summary.cancellationCount })}
      </NativeText>
      <Row alignment="center" style={{ width: '100%', paddingTop: spacing.xs }}>
        <Row testID="home-refresh" alignment="center" spacing={spacing.xs} onPress={onRefresh} style={{ paddingVertical: spacing.xs }}>
          <NativeText variant="caption" tone="secondary">
            {t('home.asOf', { time: formatClock(updatedAt) })}
          </NativeText>
          <Icon name={{ ios: 'arrow.clockwise', android: Refresh }} size={14} color={colors.secondaryText} />
        </Row>
        <Spacer flexible />
        <Column testID="home-hide-amounts" onPress={() => setHidden(!hidden)} style={{ paddingVertical: spacing.xs }}>
          <NativeText variant="caption" tone="secondary">
            {hidden ? t('home.showAmounts') : t('home.hideAmounts')}
          </NativeText>
        </Column>
      </Row>
    </HomeCard>
  );
}
