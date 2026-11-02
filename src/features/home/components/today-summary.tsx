import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { SAMPLE_STORE_NAME, SAMPLE_SUMMARY } from '../model/sample-summary';

const formatAmount = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

/**
 * What a merchant opens the app for, in the order of the merchant apps surveyed (docs/architecture/home-menu.md): today's
 * sales with the approvals/cancellations behind it, the next payout, and the month so far. The store name switches to
 * the Stores tab.
 */
export function TodaySummary({ onStorePress }: { onStorePress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const card = { padding: spacing.lg, borderRadius: 24, backgroundColor: colors.field } as const;

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      <Row testID="home-store" alignment="center" onPress={onStorePress} style={{ width: '100%', paddingVertical: spacing.xs }}>
        <NativeText variant="title">{SAMPLE_STORE_NAME}</NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={20} color={colors.secondaryText} />
        <Spacer flexible />
      </Row>
      <Column spacing={spacing.xs} style={{ width: '100%', ...card }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.todaySales')}
        </NativeText>
        <NativeText variant="largeTitle">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.todaySales) })}</NativeText>
        <NativeText variant="subhead" tone="secondary">
          {t('home.counts', { approvals: SAMPLE_SUMMARY.approvalCount, cancellations: SAMPLE_SUMMARY.cancellationCount })}
        </NativeText>
      </Column>
      <Row spacing={spacing.sm} style={{ width: '100%' }}>
        <Column spacing={spacing.xs} style={{ width: '49%', ...card }}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.nextDeposit')}
          </NativeText>
          <NativeText variant="headline">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.nextDepositAmount) })}</NativeText>
          <NativeText variant="caption" tone="secondary">
            {SAMPLE_SUMMARY.nextDepositDate}
          </NativeText>
        </Column>
        <Column spacing={spacing.xs} style={{ width: '49%', ...card }}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.monthSales')}
          </NativeText>
          <NativeText variant="headline">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.monthSales) })}</NativeText>
          <NativeText variant="caption" tone="secondary">
            {SAMPLE_SUMMARY.monthRange}
          </NativeText>
        </Column>
      </Row>
    </Column>
  );
}
