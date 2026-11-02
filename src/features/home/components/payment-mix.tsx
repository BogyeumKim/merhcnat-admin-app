import { Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { SAMPLE_PAYMENT_MIX } from '../model/sample-summary';

/** Last month's share by payment type, as a labelled list (a table reads better than a donut at phone width). */
export function PaymentMix() {
  const { t } = useTranslation();

  return (
    <HomeCard title={t('home.paymentMix')}>
      {SAMPLE_PAYMENT_MIX.map((item) => (
        <Row key={item.id} alignment="center" style={{ width: '100%', paddingVertical: spacing.xs }}>
          <NativeText variant="body">{t(`home.paymentTypes.${item.id}`)}</NativeText>
          <Spacer flexible />
          <NativeText variant="headline">{`${item.percent}%`}</NativeText>
        </Row>
      ))}
    </HomeCard>
  );
}
