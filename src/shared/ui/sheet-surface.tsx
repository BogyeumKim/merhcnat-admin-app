import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { SHEET_CORNER_RADIUS, SHEET_MAX_WIDTH, useNativeColors } from '@/shared/theme';

type SheetSurfaceProps = PropsWithChildren<{
  /** 시트 높이를 채우는 내용(`SheetFormScreen`)이면 `true`. 내용 높이에 맞추는 시트(`fitToContents`, 공지)는 `false`. */
  fill?: boolean;
  /** 아래로 끌어 닫을 수 있는 시트만 `true`: 카드 양옆(시트의 투명한 부분)을 누르면 닫는다(M3 스크림 탭과 같은 동작). */
  dismissible?: boolean;
}>;

/**
 * 폼 시트 내용의 바탕(Android M3 바텀 시트 카드).
 * react-native-screens 4.30.1 Android 폼 시트는 CoordinatorLayout + BottomSheetBehavior로 항상 창 전체 폭이고 최대 폭 옵션이 없다.
 * 그래서 넓은 창에서는 네이티브 시트를 투명하게 두고(`app/_layout.tsx`의 `sheetOptions`) 이 카드가 `SHEET_MAX_WIDTH`(640dp)로
 * 가운데에 시트 배경·둥근 모서리를 그린다. 카드 폭은 창 폭으로 계산하지 않고 부모(시트) 폭 안에서 `maxWidth`로 줄인다.
 * 시트 폭이 640 이하(폰)이면 카드가 시트를 꽉 채워 네이티브 시트와 같은 모양(같은 색, 같은 위쪽 모서리)이 된다.
 * iOS는 네이티브 page sheet가 이미 가운데 카드라 아무것도 감싸지 않는다.
 */
export function SheetSurface({ children, fill = false, dismissible = false }: SheetSurfaceProps) {
  const { background } = useNativeColors();
  if (process.env.EXPO_OS !== 'android') return children;

  return (
    <View style={fill ? styles.fill : undefined}>
      {dismissible ? (
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          style={StyleSheet.absoluteFill}
          // 연타로 `back()`이 두 번 불리면 시트 아래 화면까지 닫힌다: 이동 잠금을 거친다.
          onPress={() => navigateOnce(() => router.back())}
        />
      ) : null}
      <View style={[styles.card, { backgroundColor: background }, fill ? styles.fill : undefined]}>{children}</View>
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
