import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { SAMPLE_STORE_NAME, SAMPLE_SUMMARY } from '../model/sample-summary';

export const formatAmount = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

/** One card: the store, today's sales as the single big number, and the approvals/cancellations that make it up. */
export function TodaySummary() {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.md} style={{ width: '100%', padding: spacing.lg, borderRadius: 24, backgroundColor: colors.field }}>
      <Column spacing={2} style={{ width: '100%' }}>
        <NativeText variant="caption" tone="secondary">
          {t('home.storeCaption')}
        </NativeText>
        <NativeText variant="headline">{SAMPLE_STORE_NAME}</NativeText>
      </Column>
      <Column spacing={spacing.xs} style={{ width: '100%' }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.todaySales')}
        </NativeText>
        <NativeText variant="largeTitle">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.salesAmount) })}</NativeText>
        <NativeText variant="subhead" tone="secondary">
          {t('home.vsYesterday', { percent: SAMPLE_SUMMARY.changePercent })}
        </NativeText>
      </Column>
      <Row spacing={spacing.lg} style={{ width: '100%' }}>
        <Column spacing={2}>
          <NativeText variant="caption" tone="secondary">
            {t('home.approvals')}
          </NativeText>
          <NativeText variant="headline">{t('home.count', { count: SAMPLE_SUMMARY.approvalCount })}</NativeText>
        </Column>
        <Column spacing={2}>
          <NativeText variant="caption" tone="secondary">
            {t('home.cancellations')}
          </NativeText>
          <NativeText variant="headline">{t('home.count', { count: SAMPLE_SUMMARY.cancellationCount })}</NativeText>
        </Column>
        <Spacer flexible />
      </Row>
    </Column>
  );
}
