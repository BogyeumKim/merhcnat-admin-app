import { router } from 'expo-router';
import { useState } from 'react';

import type { ErrorCode } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { openSheet } from '@/shared/lib/open-sheet';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { useAnnounce } from '@/shared/ui/use-announce';

import { useAuthErrorPresenter } from './use-auth-error-presenter';
import { useAbandonedFlowCount } from '../model/auth-flow-store';
import type { LoginResult } from '../model/schemas';
import { acknowledgeSessionEnded, useSessionEnded } from '../model/session-store';
import { useLogin } from '../mutations/use-login';

/**
 * 로그인 화면의 동작: 한 번에 하나만 제출, 실패 표시, 서버가 요구하면 인증 단계로 이동.
 * `passwordResetKey`: 비밀번호 거부 때마다 바뀌어 비밀번호만 비운다(아이디 유지, 포커스 이동 없음).
 * `formKey`: 로그인 화면을 떠난 인증 흐름(2단계 인증, 로그인 전 비밀번호 변경)이 성공 없이 끝날 때마다 바뀐다
 * (`auth-flow-store`의 `abandonedCount`). 화면은 이를 폼 `key`로 써서 새 입력란으로 다시 마운트한다(아이디·비밀번호 모두 초기화).
 */
export function useSignIn() {
  const { t } = useTranslation();
  // 오류는 코드로만 보관하고 문장은 렌더 때 번역한다: 언어를 바꾸면 표시 중인 오류도 다시 번역된다.
  const [formErrorCode, setFormErrorCode] = useState<ErrorCode | null>(null);
  const [rejectedCount, setRejectedCount] = useState(0);
  const formKey = useAbandonedFlowCount();
  const runOnce = useRunOnce();
  const sessionEnded = useSessionEnded();

  const formError = formErrorCode ? t(`errors.${formErrorCode}`) : null;
  useAnnounce(formError);

  const presentError = useAuthErrorPresenter({
    onInline: (error) => {
      setFormErrorCode(error.code);
      if (error.code === 'INVALID_CREDENTIALS') setRejectedCount((count) => count + 1);
    },
  });

  const login = useLogin({
    onMutate: () => setFormErrorCode(null),
    onError: presentError,
  });

  /**
   * 로그인 결과에 따른 이동. 비밀번호는 일부러 입력란에 남긴다: 로그인 성공 후 이 화면을 떠날 때 OS 비밀번호 관리자(Google / Samsung Pass / iCloud Keychain)가
   * 이를 읽어 저장을 제안한다. 먼저 지우면 저장할 내용이 없어진다. 인증이 성공 없이 끝나면 그때 폼을 초기화한다(`formKey`).
   * `openSheet`가 띄우기 전에 입력란을 블러하므로 시트가 닫혀도 비밀번호 칸에 포커스·키보드가 돌아오지 않는다.
   */
  const routeAfterLogin = async (result: LoginResult) => {
    if (result.status === 'CHALLENGE_REQUIRED') await openSheet('/verify');
    // 임시비밀번호: 새 비밀번호를 등록하기 전에는 홈으로 갈 수 없다.
    else if (result.status === 'TEMP_PASSWORD_REQUIRED') router.push('/temp-password');
    // 로그인하면 라우트 그룹이 바뀐다. 비밀번호 변경 화면을 명시하지 않으면 스택이 항상 접근 가능한 아무 라우트에 떨어진다.
    else if (result.passwordChangeRequired) router.replace('/password-change');
  };

  // 잠금은 실패하면 바로, 성공하면 다음 화면으로 이동을 시작한 뒤에 푼다: 인증 시트를 띄우기 전 블러 대기 동안
  // (`reset()`으로 버튼은 다시 활성화된다) 두 번째 탭이 로그인을 또 보내 challenge를 새로 만들지 않게 한다.
  // `reset()`은 호출이 끝나는 즉시 mutation 변수(비밀번호)를 메모리에서 버린다.
  const submit = (input: { userId: string; password: string }) =>
    runOnce((done) =>
      login.mutate(input, {
        onSuccess: (result) => void routeAfterLogin(result).finally(done),
        onError: done,
        onSettled: () => login.reset(),
      }),
    );

  return {
    pending: login.isPending,
    formError,
    passwordResetKey: rejectedCount,
    formKey,
    sessionEnded,
    submit,
    dismissFormError: () => setFormErrorCode(null),
    acknowledgeSessionEnded,
  };
}
