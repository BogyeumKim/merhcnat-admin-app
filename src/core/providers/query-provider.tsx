import { focusManager, MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';

import { routeBlockingError } from '@/core/navigation/route-blocking-error';
import { registerSignOutHandler } from '@/features/auth';
import { asApiError, isApiError, type ApiError } from '@/shared/api/errors';
import { getAccessToken } from '@/shared/api/session-token';
import { translate } from '@/shared/i18n';
import { showErrorToast } from '@/shared/ui/toast';

/**
 * 일시적 실패만 재시도한다. 4xx(세션 종료 401 포함), 점검 시간, 잘못된 응답은 다시 요청해도 나아지지 않는다.
 * 503 `SESSION_STORE_UNAVAILABLE`은 세션 저장소의 일시 장애라 5xx 규칙으로 재시도한다.
 */
function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2 || !isApiError(error)) return false;
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') return true;
  return error.status >= 500 && error.code !== 'MAINTENANCE' && error.code !== 'INVALID_RESPONSE';
}

/**
 * 쿼리 오류 타입을 앱 전체에서 `ApiError`로 고정한다. `shared/api/client.ts`가 모든 실패를 `ApiError`로 던지므로
 * 화면/훅에서 `error as ApiError` 같은 캐스트가 필요 없다(그래도 런타임 값은 `asApiError`로 한 번 더 좁힌다).
 */
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

/**
 * 모든 쿼리의 최종 실패(재시도 후)를 한 곳에서 처리한다.
 * - 차단 오류(점검, 업데이트, 보안 위험 기기, 잠김, 정지)는 로그인 후라면 전용 화면으로 보낸다(`routeBlockingError`, 중복 이동 방지).
 *   점검·업데이트는 세션을 끝내고 스택을 그 화면 하나로 바꾼다(뒤로 돌아갈 앱 화면이 남지 않음).
 * - 세션 저장소 장애는 로그아웃 없이 알린다(같은 id라 여러 쿼리가 실패해도 토스트 하나).
 * - 그 밖의 `toast` 종류는 여기서 띄우지 않는다: 캐시가 있는 새로고침 실패만 화면 훅이 알린다(`use-home-screen`). 첫 로딩 실패는 화면이 지속 표시한다.
 * - 세션 종료 401은 `shared/api/client.ts`가 처리하므로 여기서 다루지 않는다(`inline` 종류라 아래 분기에도 걸리지 않는다).
 */
function onQueryError(raw: unknown) {
  const error = asApiError(raw);
  if (getAccessToken() !== null && routeBlockingError(error)) return;
  if (error.code === 'SESSION_STORE_UNAVAILABLE') {
    showErrorToast({ id: `error:${error.code}`, title: translate('errors.SESSION_STORE_UNAVAILABLE') });
  }
}

/**
 * 로그인 후 mutation의 차단 오류도 같은 경로로 보낸다. TanStack Query는 이 콜백을 mutation 자체의 `onError`보다 먼저 부르므로,
 * 화면의 `useErrorPresenter`는 중복 방지에 걸려 다시 이동하거나 토스트를 띄우지 않는다. 로그인 전(인증 흐름)은 화면 표시기가 처리한다.
 */
function onMutationError(raw: unknown) {
  if (getAccessToken() !== null) routeBlockingError(asApiError(raw));
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onQueryError }),
  mutationCache: new MutationCache({ onError: onMutationError }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: shouldRetry,
    },
    mutations: { retry: false },
  },
});

// 이 기기에 다른 사용자가 이어서 로그인할 수 있으므로 이전 사용자의 캐시는 하나도 남기지 않는다.
registerSignOutHandler(() => queryClient.clear());

export function QueryProvider({ children }: PropsWithChildren) {
  // React Native에는 window focus가 없으므로 앱 포그라운드/백그라운드를 React Query의 focus 상태로 매핑한다.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
