import { useMutation } from '@tanstack/react-query';

import { ApiError, asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { getChallengeToken } from '../model/challenge-vault';
import { registerDevicePush } from '../model/device-push';
import type { Authenticated, ChallengeMethod } from '../model/schemas';
import { assertTokenIssued, completeSignIn } from '../model/session-store';

type VerifyInput = { channel: ChallengeMethod; code: string };

/** Verifies the code on the server. Success completes the sign-in; the route guard then swaps the screens. */
export function useVerifyCode(callbacks?: UseMutationCallback<Authenticated>) {
  return useMutation({
    mutationFn: async ({ channel, code }: VerifyInput) => {
      const challengeToken = getChallengeToken();
      if (!challengeToken) throw new ApiError({ status: 0, code: 'CHALLENGE_EXPIRED' });
      const result = await authApi.verifyCode({ challengeToken, channel, code });
      assertTokenIssued();
      return result;
    },
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result) => {
      completeSignIn(result.userType, result);
      void registerDevicePush();
      callbacks?.onSuccess?.(result);
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
