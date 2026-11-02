import { Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { formatCompactAmount } from '../model/format';
import { SAMPLE_RANKING } from '../model/sample-summary';

/** Top stores by sales, for accounts that manage stores below them. */
export function StoreRanking() {
  const { t } = useTranslation();

  return (
    <HomeCard title={t('home.ranking')}>
      {SAMPLE_RANKING.map((store, index) => (
        <Row key={store.id} alignment="center" spacing={spacing.sm} style={{ width: '100%', paddingVertical: spacing.xs }}>
          <NativeText variant="headline">{String(index + 1)}</NativeText>
          <NativeText variant="body">{store.name}</NativeText>
          <Spacer flexible />
          <NativeText variant="body">{t('home.amount', { amount: formatCompactAmount(store.amount) })}</NativeText>
        </Row>
      ))}
    </HomeCard>
  );
}
