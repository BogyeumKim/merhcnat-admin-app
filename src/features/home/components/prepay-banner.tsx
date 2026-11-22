import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useCapabilities } from '@/features/auth';
import { openMenuItem, visibleItemIds } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

import { HomeCard } from './home-card';

/** 선정산 신청이 가능한 계정을 위한 프로모션 카드(참고 앱의 혜택 배너처럼). 서버의 가맹점별 플래그와 계정 유형이 모두 허용해야 한다. */
export function PrepayBanner({ available }: { available: boolean }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const allowedByType = visibleItemIds(useCapabilities()).includes('prepay');
  if (!available || !allowedByType) return null;

  return (
    <HomeCard>
      <Row testID="home-prepay" alignment="center" onPress={() => openMenuItem('prepay')} modifiers={pressableA11y()} style={{ width: '100%' }}>
        <Column spacing={2}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.prepayTitle')}
          </NativeText>
          <NativeText variant="headline">{t('home.prepayAction')}</NativeText>
        </Column>
        <Spacer flexible />
        <Icon name={icons.chevronRight} size={18} color={colors.secondaryText} />
      </Row>
    </HomeCard>
  );
}
