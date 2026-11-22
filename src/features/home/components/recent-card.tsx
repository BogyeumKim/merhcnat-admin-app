import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

import { HomeCard } from './home-card';
import { formatAmount } from '../model/format';
import { useAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';

/** 최근 카드 거래: 카드명, 시간 · 할부 · 상태, 금액. "거래내역 >" 누르면 전체 목록이 열린다. */
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
      <Row testID="home-recent-more" alignment="center" onPress={onMore} modifiers={pressableA11y()} style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.recentTitle')}</NativeText>
        <Spacer flexible />
        <NativeText variant="caption" tone="secondary">
          {t('home.recentMore')}
        </NativeText>
        <Icon name={icons.chevronRight} size={16} color={colors.secondaryText} />
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
