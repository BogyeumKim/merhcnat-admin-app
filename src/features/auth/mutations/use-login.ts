import { useMutation } from '@tanstack/react-query';

import { asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { authFlowActions } from '../model/auth-flow-store';
import { getDeviceInfo } from '../model/device-info';
import type { LoginResult } from '../model/schemas';
import { assertTokenIssued, completeSignIn } from '../model/session-store';

type LoginInput = { userId: string; password: string };

/**
 * Service side of sign-in: calls the API and records the outcome (signed in, or a pending challenge).
 * Navigation and messages belong to the screen, through `callbacks`.
 */
export function useLogin(callbacks?: UseMutationCallback<LoginResult>) {
  return useMutation({
    mutationFn: async ({ userId, password }: LoginInput) => {
      const result = await authApi.login({ userId, password, device: await getDeviceInfo() });
      if (result.status === 'AUTHENTICATED') assertTokenIssued();
      return result;
    },
    // The password is a mutation variable: do not keep it in the mutation cache after the call.
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result) => {
      if (result.status === 'AUTHENTICATED') completeSignIn(result.userType);
      else authFlowActions().start(result);
      callbacks?.onSuccess?.(result);
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
