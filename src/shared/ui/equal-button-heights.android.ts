import { useState } from 'react';

import type { EqualButtonHeights } from './equal-button-heights.types';
import { FILL_ROW } from './fill-row';
import { BUTTON_CONTENT_PADDING_VERTICAL } from './native-button-metrics';

/**
 * Compose 표준 방법은 `Row(Modifier.height(IntrinsicSize.Min))` + 자식 `fillMaxHeight()`인데, 58.0.29는 `IntrinsicSize`를
 * `width`에만 받는다(`height`는 dp 숫자만). 그래서 각 버튼 *라벨*의 높이를 `onSizeChanged`로 받아, 가장 큰 값 + 버튼 안 세로 패딩을
 * 모든 버튼의 최소 높이로 준다. 라벨 높이는 버튼 최소 높이의 영향을 받지 않으므로 되먹임이 없고,
 * 창 폭·글꼴이 바뀌어 줄바꿈이 풀리면 다시 보고되어 작아진다.
 */
export function useEqualButtonHeights(): EqualButtonHeights {
  const [heights, setHeights] = useState<readonly number[]>([]);
  const tallest = heights.reduce((max, h) => Math.max(max, h), 0);
  const minHeight = tallest > 0 ? Math.ceil(tallest + BUTTON_CONTENT_PADDING_VERTICAL * 2) : undefined;

  return {
    rowModifiers: undefined,
    cellModifiers: FILL_ROW,
    slot: (index) => ({
      minHeight,
      onContentHeight: (height) =>
        setHeights((prev) => {
          // 0.5dp 이하 변화는 무시한다(소수점 흔들림으로 다시 그리지 않게).
          if (Math.abs((prev[index] ?? 0) - height) <= 0.5) return prev;
          const next = [...prev];
          next[index] = height;
          return next;
        }),
    }),
  };
}
