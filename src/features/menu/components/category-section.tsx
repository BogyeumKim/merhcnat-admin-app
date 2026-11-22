import { Column } from '@expo/ui';

import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { MenuRow } from './menu-row';
import type { MenuItemId } from '../model/catalog';

/** 제목이 있는 행 그룹. 카테고리가 탐색 단위다: 사용자는 그룹을 고른 뒤 항목을 고른다. */
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
