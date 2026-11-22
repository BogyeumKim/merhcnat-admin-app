/**
 * 사용자 탭으로 시작하는 화면 이동(push, back, replace, 시트 열기, 로그아웃)의 앱 전체 연타 잠금.
 * 이동에는 "끝남" 콜백이 없고 `router.push`를 두 번 부르면 같은 화면이 두 번 쌓인다(`back` 두 번은 아래 화면까지 닫는다).
 * 그래서 이동 하나를 시작하면 화면 전환이 끝날 만큼의 짧은 시간 동안 다른 이동을 무시한다.
 * 네트워크 작업은 이것이 아니라 컴포넌트 단위 `useRunOnce`(요청이 끝날 때까지 잠금)를 쓴다. 규칙: `.claude/rules/data-fetching.md`.
 * 서버 응답이 정하는 `router.*` 이동(오류 화면, 라우트 가드, 인증 결과)은 이 잠금을 거치지 않는다: 사용자 연타가 아니고, 막히면 화면이 멈춘다.
 * 예외로 `openSheet`는 호출자와 무관하게 항상 거친다(시트 두 개가 겹쳐 뜨지 않게. 공지 팝업 런처는 재시도한다).
 */

/** 네이티브 push/시트 전환(약 350ms)보다 길게 잡는다. 사람이 의도해서 두 번 이동하기에는 충분히 짧다. */
const NAVIGATION_LOCK_MS = 600;

let lockedUntil = 0;

/** 다른 이동이 막 시작되어 지금 이동하면 연타로 보는가. */
export function isNavigationLocked(): boolean {
  return Date.now() < lockedUntil;
}

/** 잠겨 있지 않으면 잠그고 `go`를 실행한다. 실행했으면 `true`. */
export function navigateOnce(go: () => void): boolean {
  if (isNavigationLocked()) return false;
  lockedUntil = Date.now() + NAVIGATION_LOCK_MS;
  go();
  return true;
}
