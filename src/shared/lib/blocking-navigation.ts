import { router } from 'expo-router';

import { blockingErrorRoute } from '@/shared/api/blocking-error-route';
import type { ApiError } from '@/shared/api/errors';

type BlockingNavigator = (error: ApiError) => boolean;

/** 등록 전(테스트 등) 기본값: 차단 화면을 위에 띄운다. 앱에서는 `core/navigation/route-blocking-error.ts`가 덮어쓴다. */
let navigator: BlockingNavigator = (error) => {
  const blocking = blockingErrorRoute(error);
  if (!blocking) return false;
  router.push(blocking.href);
  return true;
};

/**
 * 차단 오류 이동을 한 곳(core)에 모은다. shared는 core를 import할 수 없으므로 core가 시작 시 등록한다
 * (`setUnauthorizedHandler`와 같은 방식). 쿼리(`QueryCache`), mutation(`MutationCache`), 화면 표시기(`useErrorPresenter`)가
 * 모두 이 경로를 거쳐, 같은 오류가 여러 곳에서 와도 이동은 한 번(중복 방지는 등록된 함수가 한다).
 */
export function setBlockingNavigator(handler: BlockingNavigator) {
  navigator = handler;
}

/** 차단 오류면 전용 화면으로 보내고(이미 처리 중이어도) `true`. 차단 오류가 아니면 `false`. */
export const navigateToBlockingScreen = (error: ApiError) => navigator(error);
