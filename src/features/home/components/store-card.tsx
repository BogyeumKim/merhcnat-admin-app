import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

import { HomeCard } from './home-card';
import { formatAmount, formatClock } from '../model/format';
import { useAmountsHidden, useSetAmountsHidden } from '../model/hide-amounts-store';
import type { HomeSummary } from '../model/schemas';

type Props = {
  summary: HomeSummary;
  /** 수치를 가져온 시각(ms). 새로고침 버튼과 함께 "14:32 기준"으로 표시한다. */
  updatedAt: number;
  /** 새로고침 진행 중: 기준 시각 대신 "새로고침 중"을 보여준다. */
  refreshing: boolean;
  onRefresh: () => void;
  onTransactions: () => void;
};

/**
 * Korpay 홈 디자인의 매출 카드: 작은 라벨, 큰 수치 하나(오늘 매출), 승인·취소 건수와 기준 시각·새로고침 버튼,
 * 구분선, 눌러서 이동하는 이번 달 매출 행. 그 아래에 "금액 숨기기"가 조용한 텍스트 버튼으로 놓인다.
 */
export function StoreCard({ summary, updatedAt, refreshing, onRefresh, onTransactions }: Props) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hidden = useAmountsHidden();
  const setHidden = useSetAmountsHidden();
  const money = (value: number) => (hidden ? t('home.hiddenAmount') : t('home.amount', { amount: formatAmount(value) }));

  return (
    <HomeCard>
      <Column testID="home-sales-detail" spacing={spacing.xs} onPress={onTransactions} modifiers={pressableA11y()} style={{ width: '100%' }}>
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
        <Row testID="home-refresh" alignment="center" spacing={spacing.xs} onPress={onRefresh} modifiers={pressableA11y(t('home.refresh'))} style={{ paddingVertical: spacing.xs }}>
          <NativeText variant="caption" tone="secondary">
            {refreshing ? t('home.refreshing') : t('home.asOf', { time: formatClock(updatedAt) })}
          </NativeText>
          <Icon name={icons.refresh} size={14} color={colors.secondaryText} accessibilityLabel={t('home.refresh')} />
        </Row>
      </Row>
      <Row
        testID="home-month-detail"
        alignment="center"
        onPress={onTransactions}
        modifiers={pressableA11y()}
        style={{ width: '100%', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
        <NativeText variant="subhead" tone="secondary">
          {t('home.monthSales')}
        </NativeText>
        <Spacer flexible />
        <NativeText variant="headline">{money(summary.monthSales)}</NativeText>
        <Icon name={icons.chevronRight} size={18} color={colors.secondaryText} />
      </Row>
      <Column testID="home-hide-amounts" onPress={() => setHidden(!hidden)} modifiers={pressableA11y()} style={{ paddingVertical: spacing.xs }}>
        <NativeText variant="caption" tone="secondary">
          {hidden ? t('home.showAmounts') : t('home.hideAmounts')}
        </NativeText>
      </Column>
    </HomeCard>
  );
}
