import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatAmount } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';

/** The latest card transactions: card name, time · installment · status, and the amount. "거래내역 >" opens the full list. */
export function RecentCard({
  items,
  onMore,
}: {
  items: NonNullable<HomeSummary['recentTransactions']>;
  onMore: () => void;
}) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();

  return (
    <HomeCard>
      <Row testID="home-recent-more" alignment="center" onPress={onMore} style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.recentTitle')}</NativeText>
        <Spacer flexible />
        <NativeText variant="caption" tone="secondary">
          {t('home.recentMore')}
        </NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />
      </Row>
      {items.map((item) => (
        <Row key={item.id} alignment="center" style={{ width: '100%', paddingVertical: spacing.xs }}>
          <Column spacing={2}>
            <NativeText variant="label">{item.cardName}</NativeText>
            <NativeText variant="caption" tone="secondary">
              {t('home.transactionMeta', {
                time: item.time,
                installment: item.installment,
                status: item.canceled ? t('home.canceled') : t('home.approved'),
              })}
            </NativeText>
          </Column>
          <Spacer flexible />
          <NativeText variant="headline">
            {hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(item.amount) })}
          </NativeText>
        </Row>
      ))}
    </HomeCard>
  );
}
