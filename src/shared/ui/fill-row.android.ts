import { weight } from '@expo/ui/jetpack-compose/modifiers';

import type { FillRowModifiers } from './fill-row.types';

/** Compose `Row`는 자식을 순서대로 측정해 긴 글이 뒤 자식의 자리를 다 쓴다. `weight(1)`은 고정 자식을 먼저 재고 남은 폭만 준다. */
export const FILL_ROW: FillRowModifiers = [weight(1)];
