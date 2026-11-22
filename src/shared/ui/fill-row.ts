import type { FillRowModifiers } from './fill-row.types';

/**
 * 범용 `Row` 안에서 남는 폭을 차지하되, 뒤따르는 고정 폭 요소(셰브런 등)보다 먼저 줄어드는 자식에 주는 modifier.
 * 긴 문구가 행 폭을 다 가져가 뒤 요소를 밀어내지 않고 줄바꿈되게 한다. 이 자식이 있으면 행에 `Spacer flexible`을 두지 않는다.
 * 이 기본 파일은 플랫폼 중립 폴백이다(iOS/Android는 각자 파일이 쓰인다).
 */
export const FILL_ROW: FillRowModifiers = undefined;
