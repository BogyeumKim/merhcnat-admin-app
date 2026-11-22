import { router } from 'expo-router';
import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { SHEET_CORNER_RADIUS, SHEET_MAX_WIDTH, useNativeColors, useWindowLayout } from '@/shared/theme';

type SheetSurfaceProps = PropsWithChildren<{
  /** 시트 높이를 채우는 내용(`SheetFormScreen`)이면 `true`. 내용 높이에 맞추는 시트(`fitToContents`, 공지)는 `false`. */
  fill?: boolean;
  /** 아래로 끌어 닫을 수 있는 시트만 `true`: 카드 양옆(시트의 투명한 부분)을 누르면 닫는다(M3 스크림 탭과 같은 동작). */
  dismissible?: boolean;
}>;

/**
 * 폼 시트 내용의 바탕(Android M3 바텀 시트 카드).
 * react-native-screens 4.30.1 Android 폼 시트는 CoordinatorLayout + BottomSheetBehavior로 항상 창 전체 폭이고 최대 폭·위 여백 옵션이 없다.
 * 그래서 네이티브 시트를 항상 투명하게 두고(`core/navigation/root-stack.tsx`의 `sheetOptions`) 이 카드가 시트 배경·둥근 모서리를 그린다.
 * - 폭: `SHEET_MAX_WIDTH`(640dp)로 가운데. 창 폭으로 계산하지 않고 부모(시트) 폭 안에서 `maxWidth`로 줄인다. 폰은 시트를 꽉 채운다.
 * - 위 여백(`fill`만): 카드 위 끝이 창 맨 위에서 `sheetTopGap`(M3 72dp, 넓은 창 56dp) 이상 떨어지게 한다. 네이티브 detent는 1로 두고
 *   (부분 detent는 `footer`가 화면 밖에 놓인다) 카드만 내린다. 시트 실제 높이를 재서 이미 그만큼 낮은 시트(부분 detent)에는 더하지 않는다.
 *   하단 버튼·키보드 처리(`imePadding`)는 카드 안에서 그대로라 버튼은 항상 키보드 위에 보이고 본문은 스크롤된다.
 * iOS는 네이티브 시트가 모양을 그리므로(위 여백은 `fullSheetDetent`) 아무것도 감싸지 않는다.
 */
export function SheetSurface({ children, fill = false, dismissible = false }: SheetSurfaceProps) {
  const { background } = useNativeColors();
  const { height: windowHeight, sheetTopGap } = useWindowLayout();
  const insets = useSafeAreaInsets();
  // 시트(투명 네이티브 시트 전체)의 실제 높이. 첫 측정 전에는 전체 높이 시트(상태 표시줄 바로 아래부터)로 본다.
  const [sheetHeight, setSheetHeight] = useState<number | null>(null);
  if (process.env.EXPO_OS !== 'android') return children;

  const sheetTop = sheetHeight === null ? insets.top : windowHeight - sheetHeight;
  const topGap = fill ? Math.max(0, sheetTopGap - sheetTop) : 0;
  const onLayout = fill ? (event: LayoutChangeEvent) => setSheetHeight(event.nativeEvent.layout.height) : undefined;

  return (
    <View style={fill ? styles.fill : undefined} onLayout={onLayout}>
      {dismissible ? (
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          style={StyleSheet.absoluteFill}
          // 연타로 `back()`이 두 번 불리면 시트 아래 화면까지 닫힌다: 이동 잠금을 거친다.
          onPress={() => navigateOnce(() => router.back())}
        />
      ) : null}
      <View style={[styles.card, { backgroundColor: background, marginTop: topGap }, fill ? styles.fill : undefined]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  card: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    alignSelf: 'center',
    borderTopLeftRadius: SHEET_CORNER_RADIUS,
    borderTopRightRadius: SHEET_CORNER_RADIUS,
    overflow: 'hidden',
  },
});
