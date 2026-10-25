import { useMutation } from '@tanstack/react-query';

import { asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import type { Authenticated } from '../model/schemas';
import { assertTokenIssued, completeSignIn } from '../model/session-store';

type VerifyInput = { challengeId: string; code: string; confirmDevice: boolean };

/** Verifies the code on the server. Success completes the sign-in; the route guard then swaps the screens. */
export function useVerifyCode(callbacks?: UseMutationCallback<Authenticated>) {
  return useMutation({
    mutationFn: async (input: VerifyInput) => {
      const result = await authApi.verifyCode(input);
      assertTokenIssued();
      return result;
    },
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result) => {
      completeSignIn(result.userType);
      callbacks?.onSuccess?.(result);
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
