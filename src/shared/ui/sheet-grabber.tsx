import { View } from 'react-native';

import { useNativeColors } from '@/shared/theme';

/** M3 드래그 핸들: 32×4dp, 완전히 둥근 막대. */
const HANDLE = { width: 32, height: 4, borderRadius: 2 } as const;
/** 핸들 위 여백. `SheetFormScreen`의 상단 패딩(24) 안에 겹쳐 그려 제목 위치를 바꾸지 않는다. */
export const SHEET_GRABBER_TOP = 8;
/** 흐름 안에 둘 때(공지 시트) 차지하는 높이: 위 8 + 핸들 4 + 아래 8. */
export const SHEET_GRABBER_ZONE = SHEET_GRABBER_TOP * 2 + HANDLE.height;

/**
 * Android 전용 시트 드래그 핸들. react-native-screens 4.30.1은 Android에서 `sheetGrabberVisible`을 저장만 하고 그리지 않는다.
 * iOS는 네이티브 그래버(`app/_layout.tsx`)라 아무것도 그리지 않는다. 장식용: 접근성 트리와 터치에서 뺀다(닫기는 시트 제스처/버튼).
 * `overlay`: 부모의 상단 패딩 위에 겹쳐 그린다. 아니면 `SHEET_GRABBER_ZONE` 높이를 차지한다.
 */
export function SheetGrabber({ overlay = false }: { overlay?: boolean }) {
  const { sheetHandle } = useNativeColors();
  if (process.env.EXPO_OS !== 'android') return null;

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[
        { alignItems: 'center', paddingTop: SHEET_GRABBER_TOP },
        overlay ? { position: 'absolute', top: 0, left: 0, right: 0 } : { height: SHEET_GRABBER_ZONE },
      ]}>
      <View style={[HANDLE, { backgroundColor: sheetHandle }]} />
    </View>
  );
}
