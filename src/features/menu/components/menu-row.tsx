import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import type { MenuItemId } from '../model/catalog';

/** One catalog entry: a plain text row with a chevron (the all-menu list reads like a table of contents, no icon per row). */
export function MenuRow({ id, onPress }: { id: MenuItemId; onPress: (id: MenuItemId) => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Row
      testID={`menu-${id}`}
      alignment="center"
      onPress={() => onPress(id)}
      style={{ width: '100%', paddingVertical: spacing.md }}>
      <NativeText variant="body">{t(`menu.items.${id}.title`)}</NativeText>
      <Spacer flexible />
      <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />
    </Row>
  );
}
