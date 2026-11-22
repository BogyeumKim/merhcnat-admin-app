import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { useNativeColors } from '@/shared/theme';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/** 브랜드 헤더 없는 전체 화면 폼 (시트가 아니라 스택의 화면): 상단은 상태 표시줄 인셋, 푸터는 키보드 위에 고정. */
export function PlainFormScreen({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();

  return (
    <View style={{ flex: 1, backgroundColor: native.background, paddingTop: topInset, paddingLeft: insets.left, paddingRight: insets.right }}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>
          {children}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
