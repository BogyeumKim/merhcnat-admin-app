import type { PropsWithChildren, ReactNode } from 'react';

export type NativeFormScrollProps = PropsWithChildren<{
  /** 하단 safe-area/내비게이션 바 인셋(dp). Android에서 사용하며 iOS는 자체 적용한다. */
  bottomInset: number;
  /**
   * 스크롤 콘텐츠 아래, 키보드 위에 고정되는 영역 (예: 주요 버튼). `@expo/ui` 요소.
   * 손쉬운 사용 글꼴(`useWindowLayout().isLargeText`)에서는 고정하지 않고 스크롤 맨 끝에 둔다: 버튼 라벨이 여러 줄로 커져
   * 고정하면 본문 스크롤 영역이 한두 줄만 남거나 버튼 글자가 잘렸다(접힌 iPhone Duo AX5 실측). 키보드가 열려 있으면 스크롤해서 닿는다.
   */
  footer?: ReactNode;
}>;
