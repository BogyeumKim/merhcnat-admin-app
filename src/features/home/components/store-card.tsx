import Event from '@expo/material-symbols/event.xml';
import CreditScore from '@expo/material-symbols/payments.xml';

import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';

import { AmountRow } from './amount-row';
import { HomeCard } from './home-card';
import { formatAmount } from '../model/format';
import { SAMPLE_STORE_NAME, SAMPLE_SUMMARY } from '../model/sample-summary';

type Handlers = { onStore: () => void; onTransactions: () => void; onDeposits: () => void };

/**
 * The store card: store name (to the Stores tab), today's sales and the next payout as figure rows with a small button
 * each, and a footer line with the approval/cancellation counts like the footer tabs of the reference apps.
 */
export function StoreCard({ onStore, onTransactions, onDeposits }: Handlers) {
  const { t } = useTranslation();

  return (
    <HomeCard title={SAMPLE_STORE_NAME} onTitlePress={onStore} testID="home-store">
      <AmountRow
        testID="home-sales-detail"
        icon={{ ios: 'wonsign.circle.fill', android: CreditScore }}
        label={t('home.todaySales')}
        amount={t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.todaySales) })}
        action={t('home.detail')}
        onAction={onTransactions}
      />
      <AmountRow
        testID="home-deposit-detail"
        icon={{ ios: 'calendar', android: Event }}
        label={`${t('home.nextDeposit')} · ${SAMPLE_SUMMARY.nextDepositDate}`}
        amount={t('home.amount', { amount: formatAmount(SAMPLE_SUMMARY.nextDepositAmount) })}
        action={t('home.lookUp')}
        onAction={onDeposits}
      />
      <NativeText variant="subhead" tone="secondary">
        {t('home.counts', { approvals: SAMPLE_SUMMARY.approvalCount, cancellations: SAMPLE_SUMMARY.cancellationCount })}
      </NativeText>
    </HomeCard>
  );
}
