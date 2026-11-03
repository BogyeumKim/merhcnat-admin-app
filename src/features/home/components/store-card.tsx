import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import Refresh from '@expo/material-symbols/refresh.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

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
 * The store card, built like the "Today" block of Stripe's dashboard: today's sales as the one big figure (tap for the
 * list) with the approval/cancellation counts under it, the next payout on a tonal row, and a footer with the as-of time (refresh) and "hide amounts".
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
      <Column
        testID="home-sales-detail"
        spacing={spacing.xs}
        onPress={onTransactions}
        style={{ width: '100%', paddingTop: spacing.xs }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.todaySales')}
        </NativeText>
        <NativeText variant="largeTitle">{money(summary.todaySales)}</NativeText>
        <NativeText variant="subhead" tone="secondary">
          {t('home.counts', { approvals: summary.approvalCount, cancellations: summary.cancellationCount })}
        </NativeText>
      </Column>
      <Row
        testID="home-deposit-detail"
        alignment="center"
        spacing={spacing.md}
        onPress={onDeposits}
        style={{ width: '100%', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.tonal }}>
        <Column spacing={2}>
          <NativeText variant="subhead" tone="secondary">
            {nextDepositDate ? `${t('home.nextDeposit')} · ${formatMonthDay(nextDepositDate)}` : t('home.nextDeposit')}
          </NativeText>
          <NativeText variant="headline">{nextDepositAmount == null ? t('home.noDeposit') : money(nextDepositAmount)}</NativeText>
        </Column>
        <Spacer flexible />
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />
      </Row>
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
