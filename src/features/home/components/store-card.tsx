import Event from '@expo/material-symbols/event.xml';
import CreditScore from '@expo/material-symbols/payments.xml';

import { useTranslation } from '@/shared/i18n';
import { NativeText } from '@/shared/ui/native-text';

import { AmountRow } from './amount-row';
import { HomeCard } from './home-card';
import { formatAmount, formatMonthDay } from '../model/format';
import type { HomeSummary } from '../model/schemas';

type Handlers = { onStore: () => void; onTransactions: () => void; onDeposits: () => void };

/**
 * The store card: store name (to the Stores tab), today's sales and the next payout as figure rows with a small button
 * each, and a footer line with the approval/cancellation counts like the footer tabs of the reference apps.
 */
export function StoreCard({ summary, onStore, onTransactions, onDeposits }: Handlers & { summary: HomeSummary }) {
  const { t } = useTranslation();
  const { nextDepositAmount, nextDepositDate } = summary;

  return (
    <HomeCard title={summary.storeName} onTitlePress={onStore} testID="home-store">
      <AmountRow
        testID="home-sales-detail"
        icon={{ ios: 'wonsign.circle.fill', android: CreditScore }}
        label={t('home.todaySales')}
        amount={t('home.amount', { amount: formatAmount(summary.todaySales) })}
        action={t('home.detail')}
        onAction={onTransactions}
      />
      <AmountRow
        testID="home-deposit-detail"
        icon={{ ios: 'calendar', android: Event }}
        label={nextDepositDate ? `${t('home.nextDeposit')} · ${formatMonthDay(nextDepositDate)}` : t('home.nextDeposit')}
        amount={nextDepositAmount == null ? t('home.noDeposit') : t('home.amount', { amount: formatAmount(nextDepositAmount) })}
        action={t('home.lookUp')}
        onAction={onDeposits}
      />
      <NativeText variant="subhead" tone="secondary">
        {t('home.counts', { approvals: summary.approvalCount, cancellations: summary.cancellationCount })}
      </NativeText>
    </HomeCard>
  );
}
