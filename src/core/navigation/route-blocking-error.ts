import { router } from 'expo-router';

import { isSignedInNow, signOutLocally } from '@/features/auth';
import { blockingErrorRoute, type BlockingPresentation } from '@/shared/api/blocking-error-route';
import type { ApiError } from '@/shared/api/errors';
import { setBlockingNavigator } from '@/shared/lib/blocking-navigation';

import { getCurrentPath } from './current-path';

/** 같은 순간 여러 쿼리·mutation이 같은 이유로 실패해도 화면을 한 번만 띄운다(경로 갱신은 렌더 뒤라 그 사이를 막는다). */
const SETTLE_MS = 1000;
let settlingUntil = 0;

/**
 * 로그인 중에 받으면 세션을 끝내는 차단 오류: 점검(503 `MAINTENANCE`)과 필수 업데이트(426 `UPDATE_REQUIRED`).
 * 서버 전체(모든 API)가 막혀 세션을 쓸 수 없고 15분 유휴 세션도 어차피 끝나므로, 해제 후에는 로그인부터 다시 한다.
 */
const ENDS_SESSION: ReadonlySet<BlockingPresentation> = new Set(['maintenance', 'update']);

/**
 * 차단 오류(점검, 업데이트, 보안 위험 기기, 잠김, 정지)를 전용 화면으로 보낸다. 앱 전체에서 이 한 곳만 한다
 * (`QueryCache`/`MutationCache` `onError`, 화면의 `useErrorPresenter` 모두 여기로 온다).
 * - 이미 그 화면이 떠 있거나(포커스 복귀 refetch가 다시 실패) 방금 이동했으면 또 이동하지 않고 `true`(처리됨)만 돌려준다.
 * - 로그인 중 점검·업데이트: 열린 시트·모달을 모두 닫고(`dismissAll`) 스택 전체를 차단 화면 하나로 바꾼 뒤(`replace`)
 *   로컬 로그아웃한다(토큰·쿼리 캐시 삭제, "로그아웃했어요" 안내 없음). 뒤에 남은 화면이 없어 뒤로가기·스와이프로 앱 화면에
 *   돌아갈 수 없다. 이동을 먼저 넣어야 `Stack.Protected`가 로그인 화면 그룹을 지울 때 포커스가 차단 화면에 있다.
 * - 그 밖(로그인 전, 또는 보안 위험 기기·잠김·정지): 지금 화면 위에 띄운다(`push`). 뒤로가기는 각 화면이 막는다(앱 종료).
 * 차단 오류가 아니면 `false`.
 */
export function routeBlockingError(error: ApiError): boolean {
  const blocking = blockingErrorRoute(error);
  if (!blocking) return false;
  const pathname = typeof blocking.href === 'string' ? blocking.href : blocking.href.pathname;
  if (getCurrentPath() === pathname || Date.now() < settlingUntil) return true;
  settlingUntil = Date.now() + SETTLE_MS;

  if (ENDS_SESSION.has(blocking.kind) && isSignedInNow()) {
    // 루트 스택에 화면이 하나뿐이면 POP_TO_TOP을 처리할 곳이 없어 개발 경고가 난다.
    if (router.canDismiss()) router.dismissAll();
    router.replace(blocking.href);
    signOutLocally();
    return true;
  }
  router.push(blocking.href);
  return true;
}

setBlockingNavigator(routeBlockingError);
