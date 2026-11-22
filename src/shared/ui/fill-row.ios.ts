import { frame } from '@expo/ui/swift-ui/modifiers';

import type { FillRowModifiers } from './fill-row.types';

/** SwiftUI 유연 프레임: 남는 폭을 채우고 내용은 앞쪽 정렬. 글은 고정 폭 형제(셰브런)를 남긴 폭 안에서 줄바꿈된다. */
export const FILL_ROW: FillRowModifiers = [frame({ maxWidth: Infinity, alignment: 'leading' })];
