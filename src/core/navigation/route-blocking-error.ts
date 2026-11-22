import { router } from 'expo-router';

import { blockingErrorRoute } from '@/shared/api/blocking-error-route';
import type { ApiError } from '@/shared/api/errors';

import { getCurrentPath } from './current-path';

/** 같은 순간 여러 쿼리가 같은 이유로 실패해도 화면을 한 번만 띄운다(경로 갱신은 렌더 뒤라 그 사이를 막는다). */
const SETTLE_MS = 1000;
let settlingUntil = 0;

/**
 * 로그인 후 쿼리의 차단 오류(점검, 업데이트, 보안 위험 기기, 잠김, 정지)를 전용 화면으로 보낸다. 앱 전체에서 이 한 곳만 한다.
 * 이미 그 화면이 떠 있으면(포커스 복귀 refetch가 다시 실패) 또 쌓지 않는다. 차단 오류가 아니면 `false`.
 */
export function routeBlockingError(error: ApiError): boolean {
  const blocking = blockingErrorRoute(error);
  if (!blocking) return false;
  const pathname = typeof blocking.href === 'string' ? blocking.href : blocking.href.pathname;
  if (getCurrentPath() === pathname || Date.now() < settlingUntil) return true;
  settlingUntil = Date.now() + SETTLE_MS;
  router.push(blocking.href);
  return true;
}
