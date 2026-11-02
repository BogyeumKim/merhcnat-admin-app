import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useCapabilities } from '@/features/auth';
import { openMenuItem, visibleItemIds } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';

/** A promotional card (like the benefit banners of the reference apps) for accounts that may request an advance payout: the server's per-merchant flag and the account type must both allow it. */
export function PrepayBanner({ available }: { available: boolean }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const allowedByType = visibleItemIds(useCapabilities()).includes('prepay');
  if (!available || !allowedByType) return null;

  return (
    <HomeCard>
      <Row testID="home-prepay" alignment="center" onPress={() => openMenuItem('prepay')} style={{ width: '100%' }}>
        <Column spacing={2}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.prepayTitle')}
          </NativeText>
          <NativeText variant="headline">{t('home.prepayAction')}</NativeText>
        </Column>
        <Spacer flexible />
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
      </Row>
    </HomeCard>
  );
}
