import { useMutation } from '@tanstack/react-query';

import { ApiError, asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { getChallengeToken } from '../model/challenge-vault';
import type { ChallengeMethod, SendCodeResult } from '../model/schemas';

/**
 * Asks the server to deliver a one-time code. The destination is chosen by the server, not the app.
 * The challenge token is read from the in-memory vault at call time, so it is never a mutation variable (those live
 * in the mutation cache). A dropped token means the sign-in expired: the caller is sent back to sign-in.
 */
export function useSendCode(callbacks?: UseMutationCallback<SendCodeResult>) {
  return useMutation({
    mutationFn: ({ channel }: { channel: ChallengeMethod }) => {
      const challengeToken = getChallengeToken();
      if (!challengeToken) throw new ApiError({ status: 0, code: 'CHALLENGE_EXPIRED' });
      return authApi.sendCode({ challengeToken, channel });
    },
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result) => callbacks?.onSuccess?.(result),
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
