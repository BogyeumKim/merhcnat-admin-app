import { ProgressView } from '@expo/ui/swift-ui';
import { controlSize, frame, tint } from '@expo/ui/swift-ui/modifiers';

/** iOS: SwiftUI 원형 `ProgressView`(small). 셰브런과 같은 정사각형 프레임에 둬 바뀔 때 행 높이·글 폭이 흔들리지 않는다. */
export function CardSpinner({ color, size }: { color: string; size: number }) {
  return <ProgressView modifiers={[controlSize('small'), tint(color), frame({ width: size, height: size })]} />;
}
