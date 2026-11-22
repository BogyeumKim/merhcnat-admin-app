import { Column, ScrollView } from '@expo/ui';
import { Box } from '@expo/ui/jetpack-compose';
import { clickable, fillMaxWidth, imePadding, matchParentSize, weight } from '@expo/ui/jetpack-compose/modifiers';
import type { PropsWithChildren } from 'react';

import { dismissKeyboard } from '@/shared/lib/focused-field';
import { useKeyboardVisible } from '@/shared/lib/use-keyboard-visible';
import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

/**
 * 스크롤 영역은 항상 부모 폭을 꽉 채운다(`fillMaxWidth`). universal `ScrollView`(Android)는 폭 지정이 없으면
 * 느슨한 제약(min 0)을 받아 내용 폭(528)으로 줄고 부모 왼쪽에 붙는다: 그 안의 `width: '100%'`는 정확한 폭이 있을 때만 풀린다.
 * 그래서 넓은 시트·창에서 본문은 왼쪽, 푸터(정확한 폭의 컬럼 안)는 가운데로 어긋났다. 폭을 채우면 본문도 푸터와 똑같이 가운데 정렬된다.
 * 폰(부모 폭 < 528)은 원래도 컬럼이 부모 폭이라 결과가 같다.
 */
const SCROLL = [fillMaxWidth(), imePadding()];
const IME = [imePadding()];
/** 컬럼 안에서 스크롤 영역은 푸터가 남긴 높이를 차지한다. */
const FILL_COLUMN = [fillMaxWidth(), weight(1)];
const FILL_WIDTH = [fillMaxWidth()];
const LAYER_IDLE = [matchParentSize()];
/** 물결 없는 클릭: 빈 곳 탭으로 키보드를 내린다. */
const LAYER_ACTIVE = [matchParentSize(), clickable(dismissKeyboard, { indication: false })];

/**
 * 빈 곳 탭 → 키보드 내림. 콘텐츠 **뒤**의 `Box` 형제 레이어가 탭을 받는다: Compose는 위 형제(입력란·버튼)가 받은 탭을
 *  아래 형제로 넘기지 않으므로 컨트롤 탭은 그대로 동작하고, 빈 곳(문구 포함)의 탭만 이 레이어로 온다.
 *  부모에 `clickable`을 주면 자식 접근성 노드가 하나로 합쳐지므로(mergeDescendants) 형제로 둔다.
 *  키보드가 보일 때만 클릭을 켠다: 평소에는 TalkBack이 이름 없는 빈 버튼을 읽지 않는다.
 *  `topCenter`: Compose `Box`는 universal 퍼센트 부모가 아니라 그 안의 `FormColumn`(`width: '100%'`)이 내용 폭(528)으로 줄고,
 *  기본 정렬(`topStart`)이면 왼쪽에 붙는다(펼친 Fold 640 시트 실측: 본문이 푸터보다 56dp 왼쪽). 가운데 정렬로 푸터와 같은 축에 둔다.
 */
function TapToDismiss({ children }: PropsWithChildren) {
  const keyboardVisible = useKeyboardVisible();

  return (
    <Box modifiers={FILL_WIDTH} contentAlignment="topCenter">
      <Box modifiers={keyboardVisible ? LAYER_ACTIVE : LAYER_IDLE} />
      {children}
    </Box>
  );
}

/**
 * `Host` 안에 네이티브로 그리는 스크롤 폼 본문 (Android).
 *  키보드: Compose의 `imePadding()`이 키보드 높이만큼 스크롤 영역을 줄이고, Compose 텍스트 필드는 스크롤되는 부모 안에서
 *  커서를 화면에 보이게 한다. JS 키보드 리스너는 없다. `footer`가 있으면 `imePadding()`을 컬럼 전체에 적용해 푸터가 키보드 위로 올라온다.
 *  `bottomInset`(내비게이션 바)은 콘텐츠 안쪽 패딩이다: Host가 바 아래까지 확장되고(edge-to-edge)
 *  키보드가 닫혀 있으면 `imePadding()`은 0이다. 열려 있는 동안은 인셋이 두 번 반영되지만, 콘텐츠 끝에 스크롤 여유가 조금 늘 뿐이다.
 */
export function NativeFormScroll({ children, bottomInset, footer }: NativeFormScrollProps) {
  if (!footer) {
    return (
      <ScrollView modifiers={SCROLL}>
        <TapToDismiss>
          <FormColumn bottomPadding={bottomInset + spacing.md}>{children}</FormColumn>
        </TapToDismiss>
      </ScrollView>
    );
  }

  return (
    <Column modifiers={IME} style={{ width: '100%', height: '100%' }}>
      <ScrollView modifiers={FILL_COLUMN}>
        <TapToDismiss>
          <FormColumn bottomPadding={spacing.md}>{children}</FormColumn>
        </TapToDismiss>
      </ScrollView>
      <FormFooter bottomPadding={bottomInset + spacing.md}>{footer}</FormFooter>
    </Column>
  );
}
