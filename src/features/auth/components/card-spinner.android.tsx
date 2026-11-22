import { CircularProgressIndicator } from '@expo/ui/jetpack-compose';
import { size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers';

const STROKE = 2;

/** Android: M3 `CircularProgressIndicator`. 셰브런과 같은 크기라 바뀔 때 행 높이·글 폭이 흔들리지 않는다. */
export function CardSpinner({ color, size }: { color: string; size: number }) {
  return <CircularProgressIndicator color={color} strokeWidth={STROKE} modifiers={[sizeModifier(size, size)]} />;
}
