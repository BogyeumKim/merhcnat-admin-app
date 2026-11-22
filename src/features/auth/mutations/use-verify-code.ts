import { useMutation } from '@tanstack/react-query';

import { ApiError, asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { authFlowActions, getAuthChallenge } from '../model/auth-flow-store';
import { getChallengeToken } from '../model/challenge-vault';
import { registerDevicePush } from '../model/device-push';
import type { ChallengeMethod, VerifyResult } from '../model/schemas';
import { assertTokenIssued, completeSignIn } from '../model/session-store';
import { holdTempPasswordToken } from '../model/temp-password-vault';

type VerifyInput = { channel: ChallengeMethod; code: string };

/** 서버에서 코드를 검증한다. 성공하면 로그인이 완료되고 라우트 가드가 화면을 교체한다. 임시비밀번호 계정은 변경 화면으로 간다. */
export function useVerifyCode(callbacks?: UseMutationCallback<VerifyResult>) {
  return useMutation({
    mutationFn: async ({ channel, code }: VerifyInput) => {
      const challengeToken = getChallengeToken();
      if (!challengeToken) throw new ApiError({ status: 0, code: 'CHALLENGE_EXPIRED' });
      const result = await authApi.verifyCode({ challengeToken, channel, code });
      if (result.status === 'TEMP_PASSWORD_REQUIRED') {
        holdTempPasswordToken(result.challengeToken, result.reason, result.userId ?? getAuthChallenge()?.enteredUserId ?? null);
        return { status: result.status };
      }
      assertTokenIssued();
      return result;
    },
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result) => {
      // 성공으로 끝남을 먼저 표시한다: 이어지는 `completeSignIn`/시트 제거의 `clear()`가 이탈로 세지 않게.
      authFlowActions().succeed();
      if (result.status === 'AUTHENTICATED') {
        completeSignIn(result, getAuthChallenge()?.enteredUserId ?? null);
        void registerDevicePush();
      }
      callbacks?.onSuccess?.(result);
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
