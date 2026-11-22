import type { Column } from '@expo/ui';
import type { ComponentProps } from 'react';

type Modifiers = ComponentProps<typeof Column>['modifiers'];

/** `NativeButton`의 `equalHeight`: 플랫폼 파일이 필요한 값만 채운다. */
export type EqualHeightSlot = {
  /** Android: 짝 버튼 중 가장 높은 버튼에 맞춘 최소 높이(dp). */
  minHeight?: number;
  /** Android: 버튼 안 라벨(내용)의 실제 높이 보고. 버튼 최소 높이와 무관한 값이라 되먹임이 없다. */
  onContentHeight?: (height: number) => void;
  /** iOS: 라벨 프레임을 세로로도 채워, 행이 정한 높이까지 버튼이 늘어나게 한다. */
  fill?: boolean;
};

export type EqualButtonHeights = {
  /** 나란한 버튼을 담는 `Row`의 modifier. */
  rowModifiers: Modifiers;
  /** 각 칸(`Column`)의 modifier: 폭을 똑같이 나누고(`FILL_ROW`와 같은 역할) 필요하면 높이도 채운다. */
  cellModifiers: Modifiers;
  /** `index`번째 버튼에 넘길 `equalHeight`. */
  slot: (index: number) => EqualHeightSlot | undefined;
};
