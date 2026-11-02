import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { formatAmount } from './today-summary';
import { SAMPLE_TRANSACTIONS } from '../model/sample-summary';

/** The latest few transactions with a link to the full list (the Transactions tab). */
export function RecentTransactions({ onViewAll }: { onViewAll: () => void }) {
  const { t } = useTranslation();

  return (
    <Column spacing={0} style={{ width: '100%' }}>
      <Row alignment="center" style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.recent')}</NativeText>
        <Spacer flexible />
        <Row testID="home-view-all" onPress={onViewAll} style={{ padding: spacing.sm }}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.viewAll')}
          </NativeText>
        </Row>
      </Row>
      {SAMPLE_TRANSACTIONS.map((transaction) => {
        const cancelled = transaction.kind === 'cancellation';
        return (
          <Row key={transaction.id} alignment="center" style={{ width: '100%', paddingVertical: spacing.sm }}>
            <Column spacing={2}>
              <NativeText variant="body">{cancelled ? t('home.cancellations') : t('home.approvals')}</NativeText>
              <NativeText variant="caption" tone="secondary">
                {transaction.time}
              </NativeText>
            </Column>
            <Spacer flexible />
            <NativeText variant="headline" tone={cancelled ? 'danger' : 'default'}>
              {t('home.amount', { amount: `${cancelled ? '-' : ''}${formatAmount(transaction.amount)}` })}
            </NativeText>
          </Row>
        );
      })}
    </Column>
  );
}
