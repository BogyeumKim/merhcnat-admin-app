import type { EqualButtonHeights } from './equal-button-heights.types';
import { FILL_ROW } from './fill-row';

const NONE: EqualButtonHeights = { rowModifiers: undefined, cellModifiers: FILL_ROW, slot: () => undefined };

/**
 * 한 줄에 나란한 `NativeButton`들(예: [카카오톡 상담][전화 상담])의 높이를 같게 맞춘다.
 * 한쪽 라벨만 큰 글꼴에서 두 줄이 되면 두 버튼 높이가 달라지는 것을 막는다.
 * `<Row modifiers={rowModifiers}><Column modifiers={cellModifiers}><NativeButton equalHeight={slot(0)} …/></Column>…</Row>`.
 * 이 기본 파일은 플랫폼 중립 폴백이다(iOS/Android는 각자 파일이 쓰인다).
 */
export function useEqualButtonHeights(): EqualButtonHeights {
  return NONE;
}
