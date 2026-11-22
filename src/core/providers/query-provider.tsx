import { focusManager, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';

import { registerSignOutHandler } from '@/features/auth';
import { isApiError } from '@/shared/api/errors';
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

const queryClient = new QueryClient({
  // 세션 저장소 장애는 로그아웃 없이 재시도 후에도 실패할 때만 알린다(같은 id라 여러 쿼리가 실패해도 토스트 하나).
  queryCache: new QueryCache({
    onError: (error) => {
      if (isApiError(error) && error.code === 'SESSION_STORE_UNAVAILABLE') {
        showErrorToast({ id: `error:${error.code}`, title: translate('errors.SESSION_STORE_UNAVAILABLE') });
      }
    },
  }),
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
