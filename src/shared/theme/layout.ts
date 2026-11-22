import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
/**
 * 전체 높이 폼 시트 위쪽 여백(dp, 창 맨 위에서 시트 위 끝까지). 시트가 화면 끝까지 올라오지 않고 뒤 화면이 보이게 남긴다.
 * Material 3 바텀 시트 사양: 위 여백 72dp, 창이 640dp보다 넓으면 56dp. iOS도 같은 값을 쓴다(`fullSheetDetent`).
 */
export const SHEET_TOP_GAP = { compact: 72, wide: 56 } as const;
/** 모든 폼 시트의 위쪽 둥근 모서리(dp). 네이티브 `sheetCornerRadius`와 Android 가운데 시트 카드가 같은 값을 쓴다. */
export const SHEET_CORNER_RADIUS = 28;

/**
 * 부분 높이 폼 시트(창 높이의 약 70%)에 인증 단계(머리 + 카드 3개 + 링크 + 하단 버튼)가 스크롤 없이 들어가는 최소 창 높이(dp).
 * 일반 휴대폰 세로(약 800dp 이상)는 넘고, 펼친 iPhone Duo 가로(669pt)·접힌 Duo(678pt)·휴대폰 가로·분할 화면은 못 미친다.
 */
export const PARTIAL_SHEET_MIN_HEIGHT = 760;
/** 이 이상의 시스템 글꼴 배율에서는 부분 높이 시트에 내용이 들어가지 않는다. */
const PARTIAL_SHEET_MAX_FONT_SCALE = 1.3;
/**
 * 손쉬운 사용 글꼴로 보는 배율(iOS AX1 약 1.65부터, Android 1.8·2.0). 이 이상이면 하단 버튼 라벨이 두세 줄로 커져
 * 나란한 버튼은 글자가 잘리고(접힌 iPhone Duo AX5에서 "카카오톡…" 실측), 시트 위 여백까지 두면 스크롤 본문이 몇 줄밖에 남지 않았다.
 */
const LARGE_TEXT_FONT_SCALE = 1.6;
/** iOS large detent 시트의 위 끝 = 창 위 safe area + 이 값(pt, 대략). 위 인셋이 0인 펼친·접힌 iPhone Duo 실측 약 8pt. */
const IOS_LARGE_DETENT_TOP = 10;

export type WidthClass = 'compact' | 'medium' | 'expanded';

export function useWindowLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const { top } = useSafeAreaInsets();

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

  /** 손쉬운 사용 글꼴 크기(`LARGE_TEXT_FONT_SCALE` 이상): 가로로 나란한 버튼은 세로로 쌓고, 시트 위 여백을 없앤다. */
  const isLargeText = fontScale >= LARGE_TEXT_FONT_SCALE;
  /**
   * 전체 높이 시트의 위쪽 여백(dp). 0인 경우: 매우 낮은 창(`isShort`: 휴대폰 가로, 분할 화면. iOS도 compact height에서는 시트를
   * 전체 화면으로 띄운다)과 손쉬운 사용 글꼴(`isLargeText`). 둘 다 여백보다 내용이 보이는 높이가 우선이다.
   */
  const sheetTopGap =
    isShort || isLargeText ? 0 : width > SHEET_MAX_WIDTH ? SHEET_TOP_GAP.wide : SHEET_TOP_GAP.compact;
  /**
   * `prefersFullSheet`일 때 쓰는 가장 큰 detent(시트 최대 높이 비율). 배열이 아니라 숫자로 준다(렌더마다 새 배열이면 `setOptions` effect가 반복된다).
   * - iOS: 비율은 large detent 높이 기준이다. large detent 위 끝은 위 safe area + 약 10pt(`IOS_LARGE_DETENT_TOP`)라,
   *   위쪽 상태 표시줄이 있는 휴대폰은 이미 여백보다 낮아 1이고, 위 인셋이 0인 창(iPhone Duo 접힘·펼침, 상태 표시줄이 옆에 있음)은
   *   창 맨 위 약 8pt까지 올라오므로(실측) 위 여백만큼 줄인 비율이 된다.
   * - Android: 1. 부분 detent는 `footer`가 화면 밖에 놓이므로 네이티브 시트는 전체 높이로 두고 `SheetSurface` 카드가 위 여백을 그린다.
   */
  const largeDetentTop = top + IOS_LARGE_DETENT_TOP;
  const fullSheetDetent =
    process.env.EXPO_OS === 'ios' && sheetTopGap > largeDetentTop
      ? Math.floor(((height - sheetTopGap) / (height - largeDetentTop)) * 100) / 100
      : 1;

  return {
    width,
    height,
    fontScale,
    widthClass,
    isLandscape,
    isWide,
    isSplit,
    isShort,
    isLargeText,
    prefersFullSheet,
    sheetTopGap,
    fullSheetDetent,
  };
}
