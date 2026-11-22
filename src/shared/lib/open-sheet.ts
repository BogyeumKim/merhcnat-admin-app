import { router, type Href } from 'expo-router';

import { blurFocusedField } from './focused-field';
import { isNavigationLocked, navigateOnce } from './navigation-lock';

/** 블러를 기다리는 동안 들어온 두 번째 열기(연타)를 무시한다. */
let opening = false;

/**
 * form sheet(`presentation: 'formSheet'`) 라우트를 여는 유일한 방법. 띄우기 **전에** 포커스된 입력란의 블러가 끝나기를 기다린다:
 * 포커스를 둔 채로 띄우면 시트가 닫힐 때 OS가 그 입력란에 포커스·키보드를 되돌린다(Android에서 확인).
 * 내비게이션 이벤트(`state` 리스너)는 표시 시작보다 늦을 수 있어 쓰지 않는다. 호출부는 `void openSheet(...)`.
 * 연타: 블러 대기 중에는 `opening`이, push 뒤 시트가 올라오는 동안에는 앱 전체 이동 잠금(`navigateOnce`)이 두 번째 열기를 막는다.
 */
export async function openSheet(href: Href) {
  if (opening || isNavigationLocked()) return;
  opening = true;
  try {
    await blurFocusedField();
    navigateOnce(() => router.push(href));
  } finally {
    opening = false;
  }
}
