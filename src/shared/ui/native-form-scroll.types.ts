import type { PropsWithChildren, ReactNode } from 'react';

export type NativeFormScrollProps = PropsWithChildren<{
  /** 하단 safe-area/내비게이션 바 인셋(dp). Android에서 사용하며 iOS는 자체 적용한다. */
  bottomInset: number;
  /** 스크롤 콘텐츠 아래, 키보드 위에 고정되는 영역 (예: 주요 버튼). `@expo/ui` 요소. */
  footer?: ReactNode;
}>;
