import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { useNativeColors, useWindowLayout } from '@/shared/theme';

import { BrandHero } from './brand-hero';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

type BrandedFormScreenProps = PropsWithChildren<{
  /** 스크롤되는 폼 아래, 키보드 위에 고정되는 영역 (주요 액션). `@expo/ui` 요소. */
  footer?: ReactNode;
  /** 로고 아래에 브랜드 태그라인을 표시한다. */
  tagline?: boolean;
}>;

/**
 * 로그인 전 폼 화면 셸: 배경 + safe area + 네이티브(SwiftUI/Compose) 스크롤 Host 하나.
 *  모든 창 크기(폰, 펼친 폴더블, 태블릿, 창 모드)에서 같은 한 컬럼이다. 넓은 창은 `FormColumn`이 최대 폭으로 가운데 정렬한다.
 *  로고·문구(`BrandHero`)는 스크롤 안 첫 요소라 큰 글꼴에서도 폼과 함께 스크롤된다.
 *  children과 `footer`는 `@expo/ui` 컴포넌트여야 한다. 네이티브 스크롤 뷰가 키보드와 큰 시스템 글자를 처리한다.
 */
export function BrandedFormScreen({ children, footer, tagline = false }: BrandedFormScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();
  const { isShort, isLargeText } = useWindowLayout();
  // 낮은 창(휴대폰 가로)은 기본 글꼴에서만 히어로를 빼서 스크롤이 생기지 않게 한다.
  // 손쉬운 사용 글꼴에서는 어차피 스크롤하므로 보인다(숨기면 내용이 사라진다).
  // 키보드가 떠도 빼지 않는다: 포커스 중 같은 네이티브 트리에서 앞 형제를 빼면 Android에서 키보드가 바로 닫혔다(Gboard 실측).
  const showHero = !isShort || isLargeText;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: native.background,
        paddingTop: topInset,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {/* Host는 창 전체 폭을 쓰고, 안쪽 `FormColumn`이 최대 폭으로 가운데 정렬한다(히어로도 같은 컬럼). */}
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>
          {showHero ? <BrandHero tagline={tagline} /> : null}
          {children}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
