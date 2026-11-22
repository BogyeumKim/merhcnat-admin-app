import { Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

import { IconBadge } from './amount-row';
import { HomeCard } from './home-card';

/** 얇은 한 행: 오늘의 결제 실패 건수. 누르면 결제 실패 목록이 열린다. */
export function FailedRow({ count, onPress }: { count: number; onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <HomeCard>
      <Row testID="home-failed" alignment="center" spacing={spacing.md} onPress={onPress} modifiers={pressableA11y()} style={{ width: '100%' }}>
        <IconBadge icon={icons.paymentFailed} />
        <NativeText variant="body">{t('home.failedToday')}</NativeText>
        <Spacer flexible />
        <NativeText variant="headline">{t('home.failedCount', { count })}</NativeText>
        <Icon name={icons.chevronRight} size={18} color={colors.secondaryText} />
      </Row>
    </HomeCard>
  );
}
