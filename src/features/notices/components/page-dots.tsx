import { Column, Row, Spacer } from '@expo/ui';
import { View } from 'react-native';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeHost } from '@/shared/ui/native-host';

const DOT = 8;

/** Page indicator of the notice carousel. The current dot is the action color; the label ("2 / 3") is read by screen readers. */
export function PageDots({ count, index, label }: { count: number; index: number; label: string }) {
  const colors = useNativeColors();

  return (
    <View accessible accessibilityLabel={label}>
      <NativeHost>
      <Row alignment="center" spacing={spacing.sm} style={{ width: '100%', paddingVertical: spacing.sm }}>
        <Spacer flexible />
        {Array.from({ length: count }, (_, position) => (
          <Column key={position} style={{ width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: position === index ? colors.action : colors.fieldBorder }}>
            <Spacer />
          </Column>
        ))}
        <Spacer flexible />
      </Row>
      </NativeHost>
    </View>
  );
}
