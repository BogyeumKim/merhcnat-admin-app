import { useMutation } from '@tanstack/react-query';

import { asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { authFlowActions } from '../model/auth-flow-store';
import { holdChallengeToken } from '../model/challenge-vault';
import { getDeviceInfo } from '../model/device-info';
import { registerDevicePush } from '../model/device-push';
import type { LoginResult } from '../model/schemas';
import { assertTokenIssued, completeSignIn } from '../model/session-store';
import { holdTempPasswordToken } from '../model/temp-password-vault';

type LoginInput = { userId: string; password: string };

/**
 * 로그인의 서비스 측: API를 호출하고 결과(로그인 완료 또는 대기 중인 challenge)를 기록한다.
 * 내비게이션과 메시지는 `callbacks`를 통해 화면이 담당한다.
 */
export function useLogin(callbacks?: UseMutationCallback<LoginResult>) {
  return useMutation({
    mutationFn: async ({ userId, password }: LoginInput) => {
      const result = await authApi.login({ userId, password, device: await getDeviceInfo() });
      if (result.status === 'AUTHENTICATED') {
        assertTokenIssued();
        return result;
      }
      if (result.status === 'TEMP_PASSWORD_REQUIRED') {
        // 임시비밀번호: 변경 화면이 이 토큰으로 호출한다(토큰은 메모리에만).
        holdTempPasswordToken(result.challengeToken, result.reason, result.userId ?? userId.trim());
        return { status: result.status };
      }
      // 코드 단계는 비밀번호 대신 이 토큰을 쓴다(`challenge-vault` 참고): 메모리에 잠시만 보관한다.
      const { challengeToken, ...challenge } = result;
      holdChallengeToken(challengeToken);
      return challenge;
    },
    // 비밀번호는 mutation 변수이므로 호출 후 mutation 캐시에 남기지 않는다(`gcTime: 0`).
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result, { userId }) => {
      const enteredUserId = userId.trim();
      if (result.status === 'AUTHENTICATED') {
        completeSignIn(result, enteredUserId);
        void registerDevicePush();
      } else if (result.status === 'CHALLENGE_REQUIRED') authFlowActions().start({ ...result, enteredUserId });
      callbacks?.onSuccess?.(result);
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
