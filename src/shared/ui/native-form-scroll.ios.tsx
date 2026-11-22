import { Column } from '@expo/ui';
import { ScrollView } from '@expo/ui/swift-ui';
import { scrollDismissesKeyboard } from '@expo/ui/swift-ui/modifiers';

import { spacing, useWindowLayout } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

/**
 * `Host` 안에 네이티브로 그리는 스크롤 폼 본문 (iOS).
 *  범용 `ScrollView`가 아니라 SwiftUI `ScrollView`를 직접 쓴다: `@expo/ui` 58.0.23의 범용 iOS `ScrollView`는 자식을 일반 SwiftUI `VStack`으로
 *  감싸 그 아래 모든 요소의 퍼센트 크기가 꺼지므로 `width: '100%'`가 콘텐츠 너비로 줄어든다. SwiftUI `ScrollView`는 자식 퍼센트를 뷰포트 기준으로 계산한다.
 *  키보드: SwiftUI `ScrollView`는 키보드 safe area를 따르고(Host는 `ignoreSafeArea`를 설정하지 않음),
 *  `scrollDismissesKeyboard`(iOS 16+)로 키보드를 드래그해 내릴 수 있다. `footer`가 있으면 컬럼 전체가 키보드 위로 줄어 푸터가 계속 보인다.
 *  홈 인디케이터 인셋은 SwiftUI가 직접 적용하므로 여기서 `bottomInset`은 쓰지 않는다.
 *  손쉬운 사용 글꼴(`isLargeText`)에서는 `footer`를 고정하지 않고 스크롤 맨 끝에 둔다(`inlineFooter`).
 */
export function NativeFormScroll({ children, footer }: NativeFormScrollProps) {
  const { isLargeText } = useWindowLayout();
  const inlineFooter = footer != null && isLargeText;
  const scroll = (
    <ScrollView modifiers={[scrollDismissesKeyboard('interactively')]}>
      {inlineFooter ? (
        <Column style={{ width: '100%' }}>
          <FormColumn bottomPadding={0}>{children}</FormColumn>
          <FormFooter bottomPadding={spacing.md}>{footer}</FormFooter>
        </Column>
      ) : (
        <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
      )}
    </ScrollView>
  );

  if (!footer || inlineFooter) return scroll;

  return (
    <Column style={{ width: '100%', height: '100%' }}>
      {scroll}
      <FormFooter bottomPadding={spacing.md}>{footer}</FormFooter>
    </Column>
  );
}
