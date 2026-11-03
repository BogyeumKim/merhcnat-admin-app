import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import Refresh from '@expo/material-symbols/refresh.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount, formatClock } from '../model/format';
import { useAmountsHidden, useSetAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';

type Props = {
  summary: HomeSummary;
  /** When the figures were fetched (ms). Shown as "as of 14:32" with a refresh button. */
  updatedAt: number;
  onRefresh: () => void;
  onTransactions: () => void;
};

/**
 * The sales card of the Korpay home design: the small label, today's sales as the one big figure, the approval and
 * cancellation counts with the as-of time and a refresh button, a divider, and this month's sales as a tappable row.
 * "Hide amounts" sits under it as a quiet text button.
 */
export function StoreCard({ summary, updatedAt, onRefresh, onTransactions }: Props) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const setHidden = useSetAmountsHidden();
  const money = (value: number) => (hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(value) }));

  return (
    <HomeCard>
      <Column testID="home-sales-detail" spacing={spacing.xs} onPress={onTransactions} style={{ width: '100%' }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.todaySales')}
        </NativeText>
        <NativeText variant="largeTitle">{money(summary.todaySales)}</NativeText>
      </Column>
      <Row alignment="center" spacing={spacing.sm} style={{ width: '100%' }}>
        <NativeText variant="caption" tone="secondary">
          {t('home.counts', { approvals: summary.approvalCount, cancellations: summary.cancellationCount })}
        </NativeText>
        <Spacer flexible />
        <Row testID="home-refresh" alignment="center" spacing={spacing.xs} onPress={onRefresh} style={{ paddingVertical: spacing.xs }}>
          <NativeText variant="caption" tone="secondary">
            {t('home.asOf', { time: formatClock(updatedAt) })}
          </NativeText>
          <Icon name={{ ios: 'arrow.clockwise', android: Refresh }} size={14} color={colors.secondaryText} />
        </Row>
      </Row>
      <Row
        testID="home-month-detail"
        alignment="center"
        onPress={onTransactions}
        style={{ width: '100%', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.monthSales')}
        </NativeText>
        <Spacer flexible />
        <NativeText variant="headline">{money(summary.monthSales)}</NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
      </Row>
      <Column testID="home-hide-amounts" onPress={() => setHidden(!hidden)} style={{ paddingVertical: spacing.xs }}>
        <NativeText variant="caption" tone="secondary">
          {hidden ? t('home.showAmounts') : t('home.hideAmounts')}
        </NativeText>
      </Column>
    </HomeCard>
  );
}
