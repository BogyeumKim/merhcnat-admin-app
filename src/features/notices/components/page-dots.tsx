import { Column, Row, Spacer } from '@expo/ui';
import { View } from 'react-native';

import { spacing, useNativeColors } from '@/shared/theme';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

const DOT = 8;

/** 공지 캐러셀의 페이지 표시기: 점(현재 점은 액션 색) 옆에 "2 / 3" 위치를 함께 보이고, 같은 라벨을 스크린 리더가 한 번에 읽는다. */
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
        <NativeText variant="caption" tone="secondary" tabular>
          {label}
        </NativeText>
        <Spacer flexible />
      </Row>
      </NativeHost>
    </View>
  );
}
