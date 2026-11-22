import { Dimensions, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** iOS 27 창 모드의 왼쪽 위 창 컨트롤(●●●)을 피하는 추가 여백(pt). */
const WINDOW_CONTROLS_CLEARANCE = 24;

/**
 * 헤더 없는 전체 화면의 위쪽 여백.
 * iOS 27 리사이즈 창 모드에서는 왼쪽 위에 창 컨트롤이 그려지는데 safe area top만으로는 로고·제목과 겹친다.
 * 창이 화면보다 작으면 창 모드로 보고 컨트롤 높이만큼 더 비운다. 화면을 꽉 채운 창(접힌/펼친 iPhone Duo 포함)은 safe area top 그대로다.
 * 화면 크기는 회전 외에는 바뀌지 않으므로 렌더마다 읽는다. 헤더가 있는 화면은 UIKit이 처리하므로 쓰지 않는다.
 */
export function useScreenTopInset() {
  const { top } = useSafeAreaInsets();
  const window = useWindowDimensions();

  if (process.env.EXPO_OS !== 'ios') return top;
  const screen = Dimensions.get('screen');
  const fillsScreen =
    Math.round(window.width) >= Math.round(Math.min(screen.width, screen.height)) &&
    Math.round(window.height) >= Math.round(Math.min(screen.width, screen.height)) &&
    Math.round(window.width * window.height) >= Math.round(screen.width * screen.height) - 1;
  return fillsScreen ? top : top + WINDOW_CONTROLS_CLEARANCE;
}
