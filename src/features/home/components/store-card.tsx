import ReceiptLong from '@expo/material-symbols/receipt_long.xml';
import Refresh from '@expo/material-symbols/refresh.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { AmountRow } from './amount-row';
import { HomeCard } from './home-card';
import { formatAmount, formatClock } from '../model/format';
import { useAmountsHidden, useSetAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';

type Props = {
  summary: HomeSummary;
  /** When the figures were fetched (ms). Shown as "as of 14:32" with a refresh button, like the reference apps. */
  updatedAt: number;
  onRefresh: () => void;
  onStore: () => void;
  onTransactions: () => void;
};

/**
 * The store card, built like the "Today" block of Stripe's dashboard: today's sales as the one big figure (tap for the
 * list) with the approval/cancellation counts under it, a badge row with a detail button, and a footer with the as-of time (refresh) and "hide amounts".
 */
export function StoreCard({ summary, updatedAt, onRefresh, onStore, onTransactions }: Props) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const setHidden = useSetAmountsHidden();
  const money = (value: number) => (hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(value) }));

  return (
    <HomeCard title={summary.storeName} onTitlePress={onStore} testID="home-store">
      <AmountRow
        icon={{ ios: 'receipt', android: ReceiptLong }}
        label={t('home.todaySales')}
        amount={money(summary.todaySales)}
        note={t('home.counts', { approvals: summary.approvalCount, cancellations: summary.cancellationCount })}
        large
        action={t('home.detail')}
        onAction={onTransactions}
        testID="home-sales-detail"
      />
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
