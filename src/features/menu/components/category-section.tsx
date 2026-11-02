import { Column } from '@expo/ui';

import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { MenuRow } from './menu-row';
import type { MenuItemId } from '../model/catalog';

/** A titled group of rows. The category is the unit of navigation: the user picks a group, then an entry. */
export function CategorySection({
  title,
  items,
  onPress,
}: {
  title: string;
  items: readonly MenuItemId[];
  onPress: (id: MenuItemId) => void;
}) {
  return (
    <Column spacing={0} style={{ width: '100%' }}>
      <NativeText variant="label" tone="secondary">
        {title}
      </NativeText>
      <Column spacing={0} style={{ width: '100%', paddingTop: spacing.xs }}>
        {items.map((item) => (
          <MenuRow key={item} id={item} onPress={onPress} />
        ))}
      </Column>
    </Column>
  );
}
