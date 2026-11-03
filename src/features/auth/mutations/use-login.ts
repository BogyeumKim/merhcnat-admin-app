import { useMutation } from '@tanstack/react-query';

import { asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { authFlowActions } from '../model/auth-flow-store';
import { holdChallengeToken } from '../model/challenge-vault';
import { getDeviceInfo } from '../model/device-info';
import { registerDevicePush } from '../model/device-push';
import { rememberUserId } from '../model/saved-user-id';
import type { LoginResult } from '../model/schemas';
import { assertTokenIssued, completeSignIn } from '../model/session-store';

/** `remember` is the "아이디 저장" box. It is acted on here, not in the screen: the sign-in screen is gone by the time the call returns. */
type LoginInput = { userId: string; password: string; remember: boolean };

/**
 * Service side of sign-in: calls the API and records the outcome (signed in, or a pending challenge).
 * Navigation and messages belong to the screen, through `callbacks`.
 */
export function useLogin(callbacks?: UseMutationCallback<LoginResult>) {
  return useMutation({
    mutationFn: async ({ userId, password }: LoginInput) => {
      const result = await authApi.login({ userId, password, device: await getDeviceInfo() });
      if (result.status === 'AUTHENTICATED') {
        assertTokenIssued();
        return result;
      }
      // The code step uses this token instead of the password (see `challenge-vault`): keep it in memory, briefly.
      const { challengeToken, ...challenge } = result;
      holdChallengeToken(challengeToken);
      return challenge;
    },
    // The password is a mutation variable: do not keep it in the mutation cache after the call (`gcTime: 0`).
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result, { userId, remember }) => {
      // The password was accepted (signed in, or a code is still needed): the ID is worth keeping, or forgetting.
      void rememberUserId(userId, remember);
      if (result.status === 'AUTHENTICATED') {
        completeSignIn(result.userType, result);
        void registerDevicePush();
      } else authFlowActions().start(result);
      callbacks?.onSuccess?.(result);
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
