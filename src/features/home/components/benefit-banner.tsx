import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';

/** One row of the notice card: a small tag chip ("혜택"), the line and a chevron (the 공지/혜택 rows of the Korpay design). */
export function TagRow({ tag, text, testID, onPress }: { tag: string; text: string; testID: string; onPress: () => void }) {
  const colors = useNativeColors();

  return (
    <Row testID={testID} alignment="center" spacing={spacing.md} onPress={onPress} style={{ width: '100%', paddingVertical: spacing.xs }}>
      <Column style={{ paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.tonal }}>
        <NativeText variant="caption">{tag}</NativeText>
      </Column>
      <NativeText variant="body">{text}</NativeText>
      <Spacer flexible />
      <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
    </Row>
  );
}

/** This month's card-installment benefits as a quiet row on a white card (it used to be a red banner, which outweighed the figures). */
export function BenefitBanner() {
  const { t } = useTranslation();

  return (
    <HomeCard>
      <TagRow tag={t('home.benefitTag')} text={t('home.benefitTitle')} testID="home-benefits" onPress={() => openMenuItem('benefits')} />
    </HomeCard>
  );
}
