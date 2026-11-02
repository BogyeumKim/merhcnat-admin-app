import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { SAMPLE_STORE_NAME, SAMPLE_SUMMARY } from '../model/sample-summary';

const formatAmount = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

/**
 * The store switcher row (the name leads to the Stores tab) and one card with the single number a merchant opens the app
 * for: today's sales. Transactions and payouts live in their own tabs, not here.
 */
export function TodaySummary({ onStorePress }: { onStorePress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.md} style={{ width: '100%' }}>
      <Row testID="home-store" alignment="center" onPress={onStorePress} style={{ width: '100%', paddingVertical: spacing.xs }}>
        <NativeText variant="title">{SAMPLE_STORE_NAME}</NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={20} color={colors.secondaryText} />
        <Spacer flexible />
      </Row>
      <Column spacing={spacing.xs} style={{ width: '100%', padding: spacing.lg, borderRadius: 24, backgroundColor: colors.field }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.todaySales')}
        </NativeText>
        <NativeText variant="largeTitle">{t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.salesAmount) })}</NativeText>
        <NativeText variant="subhead" tone="secondary">
          {t('home.vsYesterday', { percent: SAMPLE_SUMMARY.changePercent })}
        </NativeText>
      </Column>
    </Column>
  );
}
