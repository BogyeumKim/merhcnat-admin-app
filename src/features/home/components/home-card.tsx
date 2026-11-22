import { Column, Icon, Row, Spacer } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { radius, spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

/**
 * 모든 홈 블록이 얹히는 둥근 흰 카드(토스·신한·트래블월렛의 색 배경 위 카드 패턴).
 * 선택적으로 쉐브론이 붙은 굵은 제목(`onTitlePress`가 있으면 눌러서 이동)이 오고, 그 아래에 내용이 온다.
 */
export function HomeCard({ title, onTitlePress, testID, children }: PropsWithChildren<{ title?: string; onTitlePress?: () => void; testID?: string }>) {
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.card }}>
      {title ? (
        <Row testID={testID} alignment="center" onPress={onTitlePress} modifiers={onTitlePress ? pressableA11y() : undefined} style={{ width: '100%' }}>
          <NativeText variant="headline">{title}</NativeText>
          <Spacer flexible />
          {onTitlePress ? <Icon name={icons.chevronRight} size={18} color={colors.secondaryText} /> : null}
        </Row>
      ) : null}
      {children}
    </Column>
  );
}
