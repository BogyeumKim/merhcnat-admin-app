import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { spacing } from '@/shared/theme';

import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';
import { SheetGrabber } from './sheet-grabber';
import { SheetSurface } from './sheet-surface';

type SheetFormScreenProps = PropsWithChildren<{
  footer?: ReactNode;
  /** 아래로 끌어 닫을 수 있는 시트만 `true`: Android 드래그 핸들을 그린다(iOS는 라우트 옵션의 네이티브 그래버). */
  grabber?: boolean;
}>;

/** 좌우 safe area는 시트 자신의 위치 기준으로 네이티브가 계산한다(창 기준 인셋을 쓰지 않는다). */
const SIDE_EDGES: readonly Edge[] = ['left', 'right'];

/**
 * `BrandedFormScreen`과 같은 폼 모양이되 폼 시트로 띄우는 화면용: 로고와 상단 safe area가 없다. 상단 패딩은 제목이 그래버와 둥근 모서리에 가리지 않게 한다.
 * Android 핸들은 이 패딩 안에 겹쳐 그려 핸들 유무로 제목 위치가 바뀌지 않는다.
 * 좌우 인셋: `useSafeAreaInsets()`는 루트(창) 기준 값이라, 창 가운데 떠 있는 넓은 시트(펼친 iPhone Duo)에서 창 가장자리의
 * 인셋이 시트 안쪽 여백으로 잘못 들어가 콘텐츠 컬럼이 한쪽으로 쏠렸다. 네이티브 `SafeAreaView`는 이 뷰의 실제 프레임과
 * safe area가 겹치는 만큼만 패딩을 준다(가장자리에 닿지 않는 시트는 0). 아래 인셋(`bottomInset`, Android)은 시트가 화면 아래에 붙어 있어 그대로 쓴다.
 * Android 넓은 창: `SheetSurface`가 640dp 가운데 카드로 감싼다(핸들도 카드 안 가운데). 닫을 수 있는 시트(`grabber`)는 카드 양옆을 눌러 닫는다.
 */
export function SheetFormScreen({ children, footer, grabber = false }: SheetFormScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SheetSurface fill dismissible={grabber}>
      <View style={{ flex: 1 }}>
        <SafeAreaView edges={SIDE_EDGES} style={{ flex: 1, paddingTop: spacing.lg }}>
          <NativeHost fill>
            <NativeFormScroll bottomInset={insets.bottom} footer={footer}>{children}</NativeFormScroll>
          </NativeHost>
        </SafeAreaView>
        {grabber ? <SheetGrabber overlay /> : null}
      </View>
    </SheetSurface>
  );
}
