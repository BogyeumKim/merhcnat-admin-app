import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/**
 * This month's card-installment benefits as one banner in the brand red (white text on the `action` fill). Not a white
 * card on purpose: the red banner is the one accent on the page, so the benefit gets noticed without a second headline.
 */
export function BenefitBanner() {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Row
      testID="home-benefits"
      alignment="center"
      onPress={() => openMenuItem('benefits')}
      style={{ width: '100%', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.action }}>
      <Column spacing={2}>
        <NativeText variant="headline" tone="onAction">
          {t('home.benefitTitle')}
        </NativeText>
        <NativeText variant="subhead" tone="onAction">
          {t('home.benefitHint')}
        </NativeText>
      </Column>
      <Spacer flexible />
      <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.onAction} />
    </Row>
  );
}
