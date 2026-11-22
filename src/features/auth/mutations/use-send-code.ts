import { useMutation } from '@tanstack/react-query';

import { ApiError, asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { authApi } from '../api/auth-api';
import { getChallengeToken } from '../model/challenge-vault';
import type { ChallengeMethod, SendCodeResult } from '../model/schemas';

/**
 * 서버에 일회용 코드 발송을 요청한다. 수신처는 앱이 아니라 서버가 정한다.
 * challenge 토큰은 호출 시점에 메모리 vault에서 읽으므로 mutation 변수가 되지 않는다(변수는
 * mutation 캐시에 남는다). 토큰이 폐기되었다면 로그인이 만료된 것이며 호출자는 로그인 화면으로 돌려보내진다.
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
