import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import { SAMPLE_LATEST_NOTICE } from '../model/sample-summary';

/** The latest notice as a one-line banner card (like the promo cards of the reference apps). */
export function NoticeBanner({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <HomeCard>
      <Row testID="home-notice" alignment="center" onPress={onPress} style={{ width: '100%' }}>
        <Column spacing={2}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.latestNotice')}
          </NativeText>
          <NativeText variant="headline">{SAMPLE_LATEST_NOTICE.title}</NativeText>
        </Column>
        <Spacer flexible />
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
      </Row>
    </HomeCard>
  );
}
