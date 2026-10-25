import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';

import { isApiError } from '@/shared/api/errors';

/** Retry transient failures only. A 4xx, a maintenance window or a malformed response will not improve by asking again. */
function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2 || !isApiError(error)) return false;
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') return true;
  return error.status >= 500 && error.code !== 'MAINTENANCE' && error.code !== 'INVALID_RESPONSE';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: shouldRetry,
    },
    mutations: { retry: false },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  // React Native has no window focus: map app foreground/background to React Query's focus state.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
