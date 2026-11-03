import { Column, Row } from '@expo/ui';

import { openMenuItem, type MenuItemId } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';

const ACTIONS = ['faq', 'notices'] as const satisfies readonly MenuItemId[];

/** Support as a card with tonal buttons (FAQ, notices), like the support block of the Korpay design. */
export function SupportCard() {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <HomeCard title={t('home.supportTitle')}>
      <Row spacing={spacing.sm} style={{ width: '100%' }}>
        {ACTIONS.map((id) => (
          <Column
            key={id}
            testID={`home-${id}`}
            onPress={() => openMenuItem(id)}
            style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.tonal }}>
            <NativeText variant="label">{t(`menu.items.${id}.title`)}</NativeText>
          </Column>
        ))}
      </Row>
    </HomeCard>
  );
}
