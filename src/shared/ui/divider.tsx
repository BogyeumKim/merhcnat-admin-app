import { Column } from '@expo/ui';

/** 1pt 가로 구분선 (iOS, 기본). SwiftUI에서는 높이 + 배경만 있는 빈 `Column`이 그대로 그려진다. */
export function Divider({ color }: { color: string }) {
  return <Column style={{ width: '100%', height: 1, backgroundColor: color }} />;
}
