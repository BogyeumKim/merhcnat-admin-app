import { useMutation } from '@tanstack/react-query';

import { asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import type { ChallengeMethod } from '../model/schemas';

/** Asks the server to deliver a one-time code. The destination is chosen by the server, not the app. */
export function useSendCode(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: ({ challengeId, method }: { challengeId: string; method: ChallengeMethod }) =>
      authApi.sendCode({ challengeId, method }),
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
