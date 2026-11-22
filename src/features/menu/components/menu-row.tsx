import { Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';

import type { MenuItemId } from '../model/catalog';

/** 카탈로그 항목 하나: 쉐브론이 붙은 텍스트 행(전체 메뉴 목록은 목차처럼 읽히도록 행마다 아이콘을 두지 않음). */
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
      <Icon name={icons.chevronRight} size={16} color={colors.secondaryText} />
    </Row>
  );
}
