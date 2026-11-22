import { Column } from '@expo/ui';
import { Background, Rectangle, ScrollView } from '@expo/ui/swift-ui';
import {
  accessibilityHidden,
  contentShape,
  foregroundStyle,
  frame,
  onTapGesture,
  scrollDismissesKeyboard,
  shapes,
} from '@expo/ui/swift-ui/modifiers';

import { dismissKeyboard } from '@/shared/lib/focused-field';
import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

const SCROLL = [scrollDismissesKeyboard('interactively')];
/**
 * `Background`는 퍼센트 폭을 풀어 주는 universal 부모가 아니므로(`UniversalPercentageParentBoundary`) 유연 프레임으로 스크롤 폭을 채운다.
 *  안의 `FormColumn`은 이 폭을 제안받아 기존과 같이 최대 폭 가운데 컬럼이 된다.
 */
const FILL = [frame({ maxWidth: Infinity })];
/**
 * 빈 곳 탭 → 키보드 내림. 투명 사각형을 콘텐츠 **뒤**(background)에 둔다: 부모 `onTapGesture`와 달리 입력란·버튼을 누른 탭은
 *  그 컨트롤이 받고 이 레이어로 오지 않는다(부모 제스처는 입력란 탭에도 불려 커서를 옮기려다 키보드가 내려간다).
 *  투명 채움은 히트 테스트되지 않아 `contentShape`로 영역을 준다. VoiceOver에서는 숨긴다.
 */
const TAP_LAYER = [
  foregroundStyle('#00000000'),
  contentShape(shapes.rectangle()),
  onTapGesture(dismissKeyboard),
  accessibilityHidden(true),
];

/**
 * `Host` 안에 네이티브로 그리는 스크롤 폼 본문 (iOS).
 *  범용 `ScrollView`가 아니라 SwiftUI `ScrollView`를 직접 쓴다: `@expo/ui` 58.0.23의 범용 iOS `ScrollView`는 자식을 일반 SwiftUI `VStack`으로
 *  감싸 그 아래 모든 요소의 퍼센트 크기가 꺼지므로 `width: '100%'`가 콘텐츠 너비로 줄어든다. SwiftUI `ScrollView`는 자식 퍼센트를 뷰포트 기준으로 계산한다.
 *  키보드: SwiftUI `ScrollView`는 키보드 safe area를 따르고(Host는 `ignoreSafeArea`를 설정하지 않음),
 *  `scrollDismissesKeyboard`(iOS 16+)로 키보드를 드래그해 내릴 수 있고, 콘텐츠 빈 곳을 탭해도 내린다(`TAP_LAYER`).
 *  `footer`가 있으면 컬럼 전체가 키보드 위로 줄어 푸터가 계속 보인다.
 *  홈 인디케이터 인셋은 SwiftUI가 직접 적용하므로 여기서 `bottomInset`은 쓰지 않는다.
 */
export function NativeFormScroll({ children, footer }: NativeFormScrollProps) {
  const scroll = (
    <ScrollView modifiers={SCROLL}>
      <Background modifiers={FILL}>
        <Background.Content>
          <Rectangle modifiers={TAP_LAYER} />
        </Background.Content>
        <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
      </Background>
    </ScrollView>
  );

  if (!footer) return scroll;

  return (
    <Column style={{ width: '100%', height: '100%' }}>
      {scroll}
      <FormFooter bottomPadding={spacing.md}>{footer}</FormFooter>
    </Column>
  );
}
