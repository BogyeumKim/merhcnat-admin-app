import { HorizontalDivider } from '@expo/ui/jetpack-compose';

/** 1dp 가로 구분선 (Android). 자식 없는 `Column`은 Compose에서 아무것도 그리지 않으므로 Material `HorizontalDivider`를 쓴다. */
export function Divider({ color }: { color: string }) {
  return <HorizontalDivider thickness={1} color={color} />;
}
