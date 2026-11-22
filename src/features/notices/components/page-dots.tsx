import { Column, Row, Spacer } from '@expo/ui';
import { View } from 'react-native';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeHost } from '@/shared/ui/native-host';

const DOT = 8;

/** 공지 캐러셀의 페이지 표시기. 현재 점은 액션 색이며, 라벨("2 / 3")은 스크린 리더가 읽는다. */
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
