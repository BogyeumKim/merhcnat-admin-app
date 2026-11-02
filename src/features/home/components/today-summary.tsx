import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount, formatCompactAmount } from '../model/format';
import { SAMPLE_STORE_NAME, SAMPLE_SUMMARY } from '../model/sample-summary';

/**
 * The first screenful, in the order of the merchant apps surveyed (docs/architecture/home-menu.md): the store, today's
 * sales with the approvals/cancellations behind it, then next payout and the month so far (compact amounts, one line each).
 */
export function TodaySummary({ onStorePress }: { onStorePress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      <Row testID="home-store" alignment="center" onPress={onStorePress} style={{ width: '100%', paddingVertical: spacing.xs }}>
        <NativeText variant="title">{SAMPLE_STORE_NAME}</NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={20} color={colors.secondaryText} />
        <Spacer flexible />
      </Row>
      <HomeCard title={t('home.todaySales')}>
        <NativeText variant="largeTitle">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.todaySales) })}</NativeText>
        <NativeText variant="subhead" tone="secondary">
          {t('home.counts', { approvals: SAMPLE_SUMMARY.approvalCount, cancellations: SAMPLE_SUMMARY.cancellationCount })}
        </NativeText>
      </HomeCard>
      <Row spacing={spacing.sm} style={{ width: '100%' }}>
        <HomeCard width="49%" title={t('home.nextDeposit')}>
          <NativeText variant="headline">{t('home.amount', { amount: formatCompactAmount(SAMPLE_SUMMARY.nextDepositAmount) })}</NativeText>
          <NativeText variant="caption" tone="secondary">
            {SAMPLE_SUMMARY.nextDepositDate}
          </NativeText>
        </HomeCard>
        <HomeCard width="49%" title={t('home.monthSales')}>
          <NativeText variant="headline">{t('home.amount', { amount: formatCompactAmount(SAMPLE_SUMMARY.monthSales) })}</NativeText>
          <NativeText variant="caption" tone="secondary">
            {SAMPLE_SUMMARY.monthRange}
          </NativeText>
        </HomeCard>
      </Row>
    </Column>
  );
}
