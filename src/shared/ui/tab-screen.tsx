import { HeaderShownContext } from 'expo-router/react-navigation';
import { use, type PropsWithChildren, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { useNativeColors } from '@/shared/theme';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

/**
 * 탭 화면 본문: 로그인 전 화면처럼 네이티브(SwiftUI/Compose) 스크롤 Host 하나.
 *  `canvas`는 흰 카드가 놓이는 옅은 색 페이지 배경(홈)을 칠한다. `header`는 스크롤 위의 선택적 RN 노드(상단 바). children은 `@expo/ui` 컴포넌트여야 한다.
 *  상태 표시줄 인셋은 감싸는 뷰의 패딩이다. 네이티브 Stack 헤더가 보이면(설정, `/feature/[id]`) 콘텐츠가 이미 헤더 아래에서
 *  시작하므로 위쪽 인셋을 더하지 않는다(이중 여백 방지). 두 탭바(iOS 네이티브 탭, Android Compose NavigationBar)는
 *  일반 레이아웃 흐름 안에 있어 여기서 하단 인셋은 필요 없다.
 */
export function TabScreen({ children, header, canvas = false }: PropsWithChildren<{ header?: ReactNode; canvas?: boolean }>) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const headerShown = use(HeaderShownContext);
  const native = useNativeColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: canvas ? native.canvas : native.background,
        paddingTop: headerShown ? 0 : topInset,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {header}
      <NativeHost fill>
        <NativeFormScroll bottomInset={0}>{children}</NativeFormScroll>
      </NativeHost>
    </View>
  );
}
