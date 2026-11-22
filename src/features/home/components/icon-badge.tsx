import { Column, Icon } from '@expo/ui';
import type { ComponentProps } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';

type IconName = ComponentProps<typeof Icon>['name'];

const BADGE_ICON = 26;
const BADGE_PADDING = spacing.sm + spacing.xs / 2;

/** 글리프가 들어간 톤 원형 배지: 행의 맨 앞 요소. 패딩은 `Column`에 둔다(`.claude/rules/expo-ui.md` 참고). */
export function IconBadge({ icon }: { icon: IconName }) {
  const colors = useNativeColors();

  return (
    <Column style={{ padding: BADGE_PADDING, borderRadius: (BADGE_ICON + 2 * BADGE_PADDING) / 2, backgroundColor: colors.tonal }}>
      <Icon name={icon} size={BADGE_ICON} color={colors.ink} />
    </Column>
  );
}
