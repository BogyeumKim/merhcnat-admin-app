import { Column, Row } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { SAMPLE_SUMMARY } from '../model/sample-summary';

const formatAmount = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

function Tile({ children }: { children: React.ReactNode }) {
  const colors = useNativeColors();
  return (
    <Column spacing={spacing.xs} style={{ width: '49%', padding: spacing.md, borderRadius: 16, backgroundColor: colors.field }}>
      {children}
    </Column>
  );
}

/**
 * The store's day at a glance, in the order a merchant looks: today's sales (the big number), how many approvals and
 * cancellations make it up, and the next payout.
 */
export function TodaySummary() {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      <Column spacing={spacing.xs} style={{ width: '100%', padding: spacing.lg, borderRadius: 20, backgroundColor: colors.field }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.todaySales')}
        </NativeText>
        <NativeText variant="largeTitle">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.salesAmount) })}</NativeText>
        <NativeText variant="subhead" tone="secondary">
          {t('home.vsYesterday', { percent: SAMPLE_SUMMARY.changePercent })}
        </NativeText>
      </Column>
      <Row spacing={spacing.sm} style={{ width: '100%' }}>
        <Tile>
          <NativeText variant="subhead" tone="secondary">
            {t('home.approvals')}
          </NativeText>
          <NativeText variant="headline">{t('home.count', { count: SAMPLE_SUMMARY.approvalCount })}</NativeText>
        </Tile>
        <Tile>
          <NativeText variant="subhead" tone="secondary">
            {t('home.cancellations')}
          </NativeText>
          <NativeText variant="headline">{t('home.count', { count: SAMPLE_SUMMARY.cancellationCount })}</NativeText>
        </Tile>
      </Row>
      <Column spacing={spacing.xs} style={{ width: '100%', padding: spacing.md, borderRadius: 16, backgroundColor: colors.field }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.settlementTitle')}
        </NativeText>
        <NativeText variant="headline">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.settlementAmount) })}</NativeText>
        <NativeText variant="caption" tone="secondary">
          {t('home.settlementDate', { date: SAMPLE_SUMMARY.settlementDate })}
        </NativeText>
      </Column>
      <NativeText variant="caption" tone="secondary">
        {t('home.sampleNotice')}
      </NativeText>
    </Column>
  );
}
