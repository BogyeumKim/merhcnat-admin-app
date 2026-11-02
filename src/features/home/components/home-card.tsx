import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/**
 * The white rounded card every home block sits on (the card-on-tinted-page pattern of Toss, Shinhan and Travel Wallet).
 * An optional bold title with a chevron (tappable when `onTitlePress` is given), then the content.
 */
export function HomeCard({ title, onTitlePress, testID, children }: PropsWithChildren<{ title?: string; onTitlePress?: () => void; testID?: string }>) {
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%', padding: spacing.lg, borderRadius: 24, backgroundColor: colors.card }}>
      {title ? (
        <Row testID={testID} alignment="center" onPress={onTitlePress} style={{ width: '100%' }}>
          <NativeText variant="headline">{title}</NativeText>
          <Spacer flexible />
          {onTitlePress ? <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} /> : null}
        </Row>
      ) : null}
      {children}
    </Column>
  );
}
