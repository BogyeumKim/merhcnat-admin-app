import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import CreditCardOff from '@expo/material-symbols/credit_card_off.xml';
import { Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { IconBadge } from './amount-row';
import { HomeCard } from './home-card';

/** One slim row: today's failed payments with a count. Tapping opens the failed-payment list. */
export function FailedRow({ count, onPress }: { count: number; onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <HomeCard>
      <Row testID="home-failed" alignment="center" spacing={spacing.md} onPress={onPress} style={{ width: '100%' }}>
        <IconBadge icon={{ ios: 'creditcard.trianglebadge.exclamationmark', android: CreditCardOff }} />
        <NativeText variant="body">{t('home.failedToday')}</NativeText>
        <Spacer flexible />
        <NativeText variant="headline">{t('home.failedCount', { count })}</NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
      </Row>
    </HomeCard>
  );
}
