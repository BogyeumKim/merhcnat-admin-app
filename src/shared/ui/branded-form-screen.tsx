import type { PropsWithChildren, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandedLayout } from './branded-layout';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';

type BrandedFormScreenProps = PropsWithChildren<{
  /** 스크롤되는 폼 아래, 키보드 위에 고정되는 영역 (주요 액션). `@expo/ui` 요소. */
  footer?: ReactNode;
  /** 로고 아래에 브랜드 태그라인을 표시한다. */
  tagline?: boolean;
  /** 스크롤 아래 화면 맨 아래에 두는 `@expo/ui` 콘텐츠 (예: 공지 카드, 앱 버전). */
  bottomNote?: ReactNode;
}>;

/**
 * 로그인 전 폼 화면: 반응형 브랜드 레이아웃 + 네이티브(SwiftUI/Compose) 스크롤 Host 하나.
 *  children과 `footer`는 `@expo/ui` 컴포넌트여야 한다. 네이티브 스크롤 뷰가 키보드와 큰 시스템 글자를 처리한다.
 */
export function BrandedFormScreen({ children, footer, tagline, bottomNote }: BrandedFormScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <BrandedLayout tagline={tagline} bottomNote={bottomNote}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom} footer={footer}>
          {children}
        </NativeFormScroll>
      </NativeHost>
    </BrandedLayout>
  );
}
