import { zodResolver } from '@hookform/resolvers/zod';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm, useWatch, type FieldError } from 'react-hook-form';

import { toErrorCode, type ApiError } from '@/shared/api/errors';
import { useValidationMessage } from '@/shared/forms/validation';
import { useTranslation } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { showErrorToast, showSuccessToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { useAuthErrorPresenter } from './use-auth-error-presenter';
import { passwordChangeSchema, type PasswordChangeValues } from '../model/forms';
import { evaluatePasswordRules, passwordLooksValid, rulesSatisfied } from '../model/password-rules';
import { markPasswordChanged, usePasswordChangeSkippable, useSignedInUserId } from '../model/session-store';
import { clearTempPasswordToken, getTempPasswordReason, getTempPasswordToken, getTempPasswordUserId } from '../model/temp-password-vault';
import { useChangePassword, type PasswordChangeVariant } from '../mutations/use-change-password';

/** 설정에서 연 변경 화면을 닫고 설정으로 돌아간다. */
function backToSettings() {
  navigateOnce(() => {
    if (router.canGoBack()) router.back();
  });
}

/** 로그인 화면으로 돌아간다(임시비밀번호 변경을 취소). 변경 토큰은 폐기한다. */
function leaveToSignIn() {
  clearTempPasswordToken();
  navigateOnce(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/sign-in');
  });
}

/** 서버가 내린 필드 오류의 RHF `type`. 이때 `message`는 번역 전 오류 코드다. */
const SERVER_ERROR = 'server';

/** 제목·본문 문구: 임시비밀번호, 90일 만료(로그인 전 흐름 포함), 설정에서 스스로 변경. */
export type PasswordChangeCopy = 'temporary' | 'expired' | 'voluntary';

/**
 * 비밀번호 변경 화면의 동작(`temporary`는 임시비밀번호라 로그인 전, 건너뛰기 불가): 실시간 규칙 힌트, "두 번 동일" 검사, 한 번에 하나만 제출, 그리고 서버 실패가
 * 화면에 의미하는 바(현재 비밀번호 오류는 해당 입력란 아래, 규칙 위반/재사용 비밀번호는
 * 새 비밀번호 아래와 규칙 목록). 화면은 이 훅이 반환한 것만 렌더링한다.
 */
export function usePasswordChange(variant: PasswordChangeVariant = 'expired') {
  const { t } = useTranslation();
  const temporary = variant === 'temporary';
  const voluntary = variant === 'voluntary';
  const navigation = useNavigation();
  const skippable = usePasswordChangeSkippable() && variant === 'expired';
  const runOnce = useRunOnce();
  // 임시비밀번호 흐름의 사유·아이디는 vault에서 한 번만 읽는다(화면이 떠나며 vault가 비워져도 문구가 바뀌지 않게).
  const [tempReason] = useState(getTempPasswordReason);
  const [tempUserId] = useState(getTempPasswordUserId);
  const signedInUserId = useSignedInUserId();
  const userId = temporary ? tempUserId : signedInUserId;
  const copy: PasswordChangeCopy = temporary ? (tempReason === 'PASSWORD_EXPIRED' ? 'expired' : 'temporary') : voluntary ? 'voluntary' : 'expired';
  // 서버 판정 중 입력란 오류(현재 비밀번호 오류, 새 비밀번호 거부)는 RHF 필드 오류(`type: 'server'`, `message`는 오류 코드)로 둔다.
  // 규칙 목록 강조(위반 항목, 재사용)는 오류 문장이 아닌 힌트라 따로 보관한다.
  const [violations, setViolations] = useState<readonly string[]>([]);
  const [reused, setReused] = useState(false);
  const [confirmBlurred, setConfirmBlurred] = useState(false);

  const { control, handleSubmit, formState, setFocus, setError, clearErrors } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    // 필드 오류는 제출 때만(로그인 폼과 같은 정책), 제출 뒤에는 입력마다 다시 검증한다. 규칙 목록·일치 표시는 오류가 아닌 힌트라 `useWatch`로 계속 실시간이다.
    // `isValid`는 구독 중이면 모드와 무관하게 입력마다 계산된다.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = useWatch({ control, name: 'newPassword' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });

  const validationMessage = useValidationMessage();
  // 문장은 렌더 때 번역한다: 언어를 바꾸면 표시 중인 오류도 다시 번역된다.
  const messageOf = (error: FieldError | undefined): string | null => {
    if (error?.type !== SERVER_ERROR) return validationMessage(error);
    // 남은 시도 횟수(`remainingAttempts`)는 어디에도 보여주지 않는다(디자인 공통 규칙).
    return t(`errors.${toErrorCode(error.message)}`);
  };
  const currentError = messageOf(formState.errors.currentPassword);
  const newError = messageOf(formState.errors.newPassword);

  useAnnounce(currentError ?? newError);

  /** 새 비밀번호에 대한 서버 판정(오류 + 규칙 목록 강조)을 지운다. */
  const clearNewServerError = () => {
    clearErrors('newPassword');
    setViolations([]);
    setReused(false);
  };
  const clearServerErrors = () => {
    clearErrors('currentPassword');
    clearNewServerError();
  };

  // 임시비밀번호: 토큰 없이 열렸으면(오래된 링크, 만료) 로그인으로 돌려보내고, 화면이 사라지면 토큰을 폐기한다.
  // 로그인 없이 사라져 로그인 화면으로 돌아가도 그 폼의 아이디·비밀번호는 그대로 둔다.
  useEffect(() => {
    if (!temporary) return;
    if (!getTempPasswordToken()) router.replace('/sign-in');
    const unsubscribe = navigation.addListener('removed', clearTempPasswordToken);
    return () => queueMicrotask(unsubscribe);
  }, [temporary, navigation]);

  // "다음에"를 허용하지 않는 만료 변경은 Android 뒤로가기로도 빠져나갈 수 없다(디자인 1-9). 임시비밀번호·설정은 뒤로가기 = 취소.
  useBlockBackButton(variant === 'expired' && !skippable);

  const presentInline = useAuthErrorPresenter({
    onInline: ({ code, extras }) => {
      if (code === 'CURRENT_PASSWORD_INVALID') {
        setError('currentPassword', { type: SERVER_ERROR, message: code });
        return;
      }
      if (code === 'PASSWORD_POLICY_VIOLATION') {
        const list = extras.violations;
        setViolations(Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : []);
      } else if (code === 'PASSWORD_REUSED') {
        setReused(true);
      }
      setError('newPassword', { type: SERVER_ERROR, message: code });
    },
  });

  const presentError = (error: ApiError) => {
    // 변경 토큰이 만료됐다: 로그인부터 다시 해야 한다.
    if (temporary && error.code === 'CHALLENGE_EXPIRED') {
      showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
      leaveToSignIn();
      return;
    }
    presentInline(error);
  };

  const change = useChangePassword(variant, {
    onMutate: clearServerErrors,
    onSuccess: () => {
      // 임시비밀번호는 로그인 완료, 만료 변경은 게이트 해제로 `Stack.Protected`가 홈으로 보낸다. 설정에서 연 변경만 직접 돌아간다.
      showSuccessToast({ id: 'password-changed', title: t('auth.passwordChange.done') });
      if (voluntary) backToSettings();
    },
    onError: presentError,
  });

  const rules = evaluatePasswordRules(newPassword, { violations, reused, userId });
  const same = confirmPassword.length > 0 && confirmPassword === newPassword;
  // 확인 칸 결과는 새 비밀번호 길이만큼 입력했거나 칸을 벗어났을 때만 보인다(입력 도중 "일치하지 않아요"로 혼내지 않음).
  const showMatch = confirmPassword.length > 0 && (confirmPassword.length >= newPassword.length || confirmBlurred);
  const matches = showMatch && same;
  const mismatch = showMatch && !same;
  // 버튼: 앱이 판단할 수 있는 규칙을 모두 만족하고 확인 칸까지 같을 때만 활성.
  const canSubmit = formState.isValid && passwordLooksValid(newPassword) && rulesSatisfied(rules) && same && !change.isPending;

  const submit = handleSubmit(({ currentPassword, newPassword: next }) => {
    // 키보드 "완료"로도 들어오므로 버튼과 같은 조건을 다시 확인한다(규칙·일치 검사는 스키마 밖에 있다).
    if (!canSubmit) return;
    // 성공하면 이 화면을 떠나므로(로그인 완료·게이트 해제로 홈, 설정으로 돌아감) 잠금을 풀지 않는다: 화면이 사라지는 동안
    // `reset()`으로 다시 활성화된 버튼을 눌러도 두 번째 변경(이미 쓴 임시 토큰·바뀐 현재 비밀번호)을 보내지 않는다. 실패만 푼다.
    runOnce((done) =>
      change.mutate(
        { currentPassword, newPassword: next },
        {
          onError: done,
          onSettled: () => change.reset(),
        },
      ),
    );
  });

  return {
    control,
    copy,
    rules,
    matches,
    mismatch,
    currentError,
    newError,
    canSubmit,
    pending: change.isPending,
    submit: () => void submit(),
    /** 사용자가 고치기 시작하면 그 입력란에 대한 서버 오류를 지운다(이전 값에 대한 판정이므로). */
    changeCurrent: () => clearErrors('currentPassword'),
    changeNew: clearNewServerError,
    focusNew: () => setFocus('newPassword'),
    focusConfirm: () => setFocus('confirmPassword'),
    blurConfirm: () => setConfirmBlurred(true),
    /** 서버가 허용하는 경우에만. 아무것도 바꾸지 않고 게이트를 푼다. */
    skip: skippable ? () => navigateOnce(markPasswordChanged) : undefined,
    /** 임시비밀번호는 변경을 취소하고 로그인으로, 설정에서 연 변경은 설정으로 돌아간다. */
    leave: temporary ? leaveToSignIn : voluntary ? backToSettings : undefined,
  };
}
