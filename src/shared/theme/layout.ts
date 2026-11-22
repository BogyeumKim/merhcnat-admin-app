import { useWindowDimensions } from 'react-native';

/**
 * dp 단위 너비 브레이크포인트로, Material window size class(compact < 600, medium < 840,
 * expanded)를 따른다. 레이아웃은 기기 이름이 아니라 *윈도우*에 반응하므로 폴더블(iPhone Duo, Galaxy Fold),
 * 태블릿, 분할 화면, iOS 27 크기 조절 윈도우가 모두 같은 방식으로 동작한다.
 */
export const BREAKPOINTS = { medium: 600, expanded: 840 } as const;

/**
 * 폼·시트·카드 같은 콘텐츠 컬럼의 최대 폭(좌우 여백 포함, dp). 넓은 창에서는 이 폭으로 가운데 정렬한다.
 * 펼친 폴더블에서 입력창·버튼이 창 끝까지 늘어나거나 한쪽으로 쏠리지 않게 하는 단일 기준값이다.
 */
export const CONTENT_MAX_WIDTH = 528;

/**
 * Android 폼 시트(M3 바텀 시트)의 최대 폭(dp). 창이 이보다 넓으면(펼친 폴더블, 태블릿) 시트를 이 폭으로 가운데 띄운다.
 * Material 3 `BottomSheetDefaults.SheetMaxWidth`(640dp)와 같다. iOS는 네이티브 page sheet가 알아서 가운데 카드로 띄운다.
 */
export const SHEET_MAX_WIDTH = 640;
/** 모든 폼 시트의 위쪽 둥근 모서리(dp). 네이티브 `sheetCornerRadius`와 Android 가운데 시트 카드가 같은 값을 쓴다. */
export const SHEET_CORNER_RADIUS = 28;

/**
 * 부분 높이 폼 시트(창 높이의 약 70%)에 인증 단계(머리 + 카드 3개 + 링크 + 하단 버튼)가 스크롤 없이 들어가는 최소 창 높이(dp).
 * 일반 휴대폰 세로(약 800dp 이상)는 넘고, 펼친 iPhone Duo 가로(669pt)·접힌 Duo(678pt)·휴대폰 가로·분할 화면은 못 미친다.
 */
export const PARTIAL_SHEET_MIN_HEIGHT = 760;
/** 이 이상의 시스템 글꼴 배율에서는 부분 높이 시트에 내용이 들어가지 않는다. */
const PARTIAL_SHEET_MAX_FONT_SCALE = 1.3;

export type WidthClass = 'compact' | 'medium' | 'expanded';

export function useWindowLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  const widthClass: WidthClass =
    width >= BREAKPOINTS.expanded ? 'expanded' : width >= BREAKPOINTS.medium ? 'medium' : 'compact';
  const isLandscape = width > height;
  /** 펼친 폴더블, 태블릿, 넓은 창: 콘텐츠를 `CONTENT_MAX_WIDTH`로 가운데 둔다. */
  const isWide = widthClass !== 'compact';
  /**
   * 좌우 두 영역(디자인: 펼친 iPhone Duo 가로, 펼친 Galaxy Fold): 넓고 가로이거나 정사각형에 가까운 창.
   * 접히는 선이 화면 가운데라 두 영역을 정확히 반씩 나누면 어떤 요소도 접히는 선을 넘지 않는다.
   * 세로로 긴 넓은 창(태블릿·펼친 Duo 세로)은 한 컬럼이 낫다.
   */
  const isSplit = isWide && width >= height * 0.85;
  /** 세로 공간이 매우 적을 때(휴대폰 가로, 분할 화면): 장식 요소를 줄인다. */
  const isShort = height < 520;

  /**
   * 폼 시트를 부분 높이 대신 전체 높이(detent `[1]`)로 띄워야 하는 창: 창이 낮거나(펼친 폴더블 가로, 휴대폰 가로, 분할 화면),
   * 좌우 분할 창이거나, 글꼴이 커서 부분 높이에서는 하단 버튼 뒤로 내용이 가려지는 경우. 휴대폰 세로 기본 글꼴은 그대로 부분 높이.
   */
  const prefersFullSheet = height < PARTIAL_SHEET_MIN_HEIGHT || isSplit || fontScale >= PARTIAL_SHEET_MAX_FONT_SCALE;

  return { width, height, fontScale, widthClass, isLandscape, isWide, isSplit, isShort, prefersFullSheet };
}
