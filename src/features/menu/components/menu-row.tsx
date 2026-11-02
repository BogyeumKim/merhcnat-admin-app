import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, ListItem } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { FieldUnderline } from '@/shared/ui/field-underline';
import { NativeText } from '@/shared/ui/native-text';

import type { MenuItemId } from '../model/catalog';
import { MENU_ICONS } from '../model/icons';

/** One catalog entry as a native list row: icon, title, one line of hint, chevron. */
export function MenuRow({ id, onPress }: { id: MenuItemId; onPress: (id: MenuItemId) => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column style={{ width: '100%' }}>
      <Column style={{ width: '100%', paddingVertical: spacing.xs }}>
        <ListItem
          testID={`menu-${id}`}
          leading={<Icon name={MENU_ICONS[id]} size={24} color={colors.action} />}
          trailing={<Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />}
          supportingText={
            <NativeText variant="subhead" tone="secondary">
              {t(`menu.items.${id}.hint`)}
            </NativeText>
          }
          onPress={() => onPress(id)}>
          <NativeText variant="headline">{t(`menu.items.${id}.title`)}</NativeText>
        </ListItem>
      </Column>
      <FieldUnderline invalid={false} focused={false} />
    </Column>
  );
}
