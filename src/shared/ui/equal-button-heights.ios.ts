import { fixedSize, frame } from '@expo/ui/swift-ui/modifiers';

import type { EqualButtonHeights, EqualHeightSlot } from './equal-button-heights.types';

/**
 * SwiftUI 표준 패턴: 행에 `fixedSize(vertical: true)`를 주면 행 높이가 자식 이상적 높이 중 최댓값이 되고,
 * 칸과 버튼 라벨의 `frame(maxHeight: .infinity)`가 그 높이까지 늘어난다. 측정·상태 없이 레이아웃만으로 맞춘다.
 * `fixedSize`가 없으면 `maxHeight: .infinity`가 스크롤/시트 높이 전체로 퍼진다.
 */
const ROW = [fixedSize({ vertical: true })];
/** `FILL_ROW`(폭 균등 분배) + 세로 채움. */
const CELL = [frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'top' })];
const FILL: EqualHeightSlot = { fill: true };
const RESULT: EqualButtonHeights = { rowModifiers: ROW, cellModifiers: CELL, slot: () => FILL };

export function useEqualButtonHeights(): EqualButtonHeights {
  return RESULT;
}
