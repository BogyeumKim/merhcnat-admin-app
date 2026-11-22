import { useMutation } from '@tanstack/react-query';

import { asApiError, ApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { changePassword, changeTempPassword, type ChangePasswordInput } from '../api/password-api';
import { registerDevicePush } from '../model/device-push';
import { assertTokenIssued, completeSignIn, markPasswordChanged } from '../model/session-store';
import { clearTempPasswordToken, getTempPasswordToken, getTempPasswordUserId } from '../model/temp-password-vault';

/**
 * `expired`: 90일 경과로 로그인 후 변경. `temporary`: 임시비밀번호라 로그인 전에 변경(성공하면 로그인까지 완료).
 * `voluntary`: 로그인 중 설정에서 스스로 변경(`expired`와 같은 API, 로그인 유지).
 */
export type PasswordChangeVariant = 'expired' | 'temporary' | 'voluntary';

/**
 * 비밀번호를 변경한다. `expired`·`voluntary`는 로그인을 유지한다: 서버가 세션을 새 토큰으로 바꿔 `Access-Token` 헤더로 주고
 * API 클라이언트가 메모리 토큰을 교체한다(이전 토큰은 `SESSION_REPLACED`). `temporary`는 변경과 동시에 로그인이 완료된다.
 * 비밀번호는 보관하지 않는다(`gcTime: 0`).
 */
export function useChangePassword(variant: PasswordChangeVariant, callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      if (variant !== 'temporary') {
        await changePassword(input);
        return null;
      }
      const challengeToken = getTempPasswordToken();
      if (!challengeToken) throw new ApiError({ status: 0, code: 'CHALLENGE_EXPIRED' });
      const result = await changeTempPassword({ ...input, challengeToken });
      assertTokenIssued();
      return result;
    },
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: (result) => {
      if (result) {
        // 아이디를 세션으로 넘긴 뒤 토큰을 버린다(순서 주의).
        completeSignIn(result, getTempPasswordUserId());
        clearTempPasswordToken();
        void registerDevicePush();
      } else {
        // 새 토큰은 이미 적용됐다. 변경 요구 게이트를 풀어 메인 화면 그룹이 열리게 한다.
        markPasswordChanged();
      }
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
