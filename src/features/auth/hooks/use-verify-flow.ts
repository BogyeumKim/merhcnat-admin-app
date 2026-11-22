import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { useWindowLayout } from '@/shared/theme';
import { showErrorToast, showSuccessToast } from '@/shared/ui/toast';
import { useAnnounce } from '@/shared/ui/use-announce';

import { useAuthErrorPresenter } from './use-auth-error-presenter';
import type { ChallengeMethod, ChallengeRequired } from '../model/schemas';
import { useSendCode } from '../mutations/use-send-code';
import { useVerifyCode } from '../mutations/use-verify-code';

/**
 * 단계별 시트 높이: 선택 단계(기기 확인, 받을 곳 선택, 연락처 없음)는 화면을 채우지 않고, 코드 단계는 키보드에 맞춰 커진다.
 * 창이 낮거나 분할 창·큰 글꼴이면(`prefersFullSheet`, 예: 펼친 iPhone Duo 가로 669pt) 부분 높이에서는 세 번째 카드가
 * 하단 "닫기" 뒤로 가려지므로 전체 높이로 띄운다. 'fitToContents'는 쓰지 않는다: 시트 내용(`SheetFormScreen`)이
 * 스크롤 + 하단 고정 버튼으로 창을 채우는 구조라 고유 높이가 없다. Android는 부분 높이에서 footer가 화면 밖에 놓이므로 코드 단계는 항상 `[1]`.
 */
const CHOICE_DETENTS = [0.72];
const CODE_DETENTS = process.env.EXPO_OS === 'android' ? [1] : [0.7, 1];
const FULL_DETENTS = [1];

/** 코드를 보낸 뒤 문자 코드 흐름의 진행 상태. 서버의 초 단위를 epoch ms로 변환한 값. */
type SentCode = { method: ChallengeMethod; destination: string | null; expiresAt: number; resendAt: number };

/**
 * 화면 안에 유지되는 서버 오류(번역 전 코드). 남은 시도 횟수(`remainingAttempts`)는 서버가 보내도 쓰지 않는다:
 * 디자인 원칙상 몇 번 남았는지·몇 번 틀리면 잠기는지는 어디에도 보이지 않는다(로그인 UX 명세 "공통").
 */
type InlineError = Pick<ApiError, 'code'>;

/**
 * 인증 시트의 단계. 코드를 너무 많이 틀리면 서버는 별도 "시도 소진" 코드 없이 비밀번호·코드 오류 합산 5회째부터
 * 423 `ACCOUNT_LOCKED`를 준다(`OTP_ATTEMPTS_EXCEEDED`는 폐지, 계약 문서). 이 잠김은 다른 차단 오류와 같이
 * 공용 표시기가 `/account-locked` 화면으로 보낸다(시트 안 단계가 아니다).
 */
export type VerifyStep = 'noContact' | 'device' | 'method' | 'code';

/** "인증번호를 다시 보냈어요" 확인 토스트 id(연타해도 한 개만 갱신된다). */
const RESENT_TOAST_ID = 'otp-resent';

/** 단계가 바뀐 직후의 연타 잠금 시간: 새 단계의 같은 자리 버튼(기기 "변경" → 이메일 "인증번호 받기")이 두 번째 탭을 받지 않게 한다. */
const STEP_SETTLE_MS = 500;

/** 닫기 X·취소 버튼·발송 한도 오류가 모두 부른다. 이동 잠금으로 `back()`이 두 번 불려 로그인 화면까지 닫히지 않게 한다. */
function leaveVerification() {
  navigateOnce(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/sign-in');
  });
}

/**
 * 단계: 새/변경 기기 확인 -> 전달 방식 선택(문자 코드만) -> 코드 입력. 화면은 단계를 렌더링만 하고,
 * 다음에 무엇을 할지 결정하는 모든 로직은 여기에 있다.
 */
export function useVerifyFlow(challenge: ChallengeRequired) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { prefersFullSheet } = useWindowLayout();
  const runOnce = useRunOnce();
  const isTotp = challenge.methods.some((option) => option.method === 'TOTP');
  // 서버가 빈 `channels`를 줌: 휴대폰·이메일이 모두 없어 진행할 수 없다(고객센터 안내만).
  const noContact = challenge.methods.length === 0;

  // 새 기기(`NONE`)는 바로 코드 받을 방식 선택으로 간다(Korpay 디자인). 다른 기기를 대체하는 기기(`CHANGED`)만
  // 먼저 확인을 받는다.
  const [deviceConfirmed, setDeviceConfirmed] = useState(challenge.deviceState !== 'CHANGED');
  // 지금 입력 중인 코드. 받을 곳 다시 고르기로 돌아가면 버린다: 카드를 누르면(같은 수단이어도) 항상 새 코드를 보낸다.
  const [sent, setSent] = useState<SentCode | null>(null);
  // 오류는 코드로만 보관하고 문장은 렌더 때 번역한다: 언어를 바꾸면 표시 중인 오류도 다시 번역된다.
  const [error, setError] = useState<InlineError | null>(null);
  // 검증이 실패할 때마다 올린다: 코드 칸을 다시 마운트해 6칸을 비운다(포커스는 옮기지 않는다). 새 코드를 받으면 0으로 돌린다.
  const [attempt, setAttempt] = useState(0);

  const errorMessage = !error
    ? null
    : error.code === 'OTP_INVALID'
      ? t(isTotp ? 'auth.verify.wrongTotp' : 'auth.verify.wrongCode')
      : t(`errors.${error.code}`);
  useAnnounce(errorMessage);

  const step: VerifyStep = noContact ? 'noContact' : !deviceConfirmed ? 'device' : isTotp || sent ? 'code' : 'method';

  // 각 단계가 자신의 시트 detent를 정한다(라우트 기본값은 `app/_layout.tsx`).
  const detents = prefersFullSheet ? FULL_DETENTS : step === 'code' ? CODE_DETENTS : CHOICE_DETENTS;
  useEffect(() => {
    navigation.setOptions({ sheetAllowedDetents: detents });
  }, [navigation, detents]);

  // 취소 시 challenge는 지우지 않는다: 시트가 사라지기 전에 비우면 `useVerifyRouteGuard`의 리다이렉트가 발동해
  // 닫히는 도중 라우트가 교체된다. `removed` 리스너가 비운다.
  const cancel = leaveVerification;

  const presentError = useAuthErrorPresenter({
    onInline: ({ code }) => setError({ code }),
  });

  const handleError = (error: ApiError) => {
    // challenge 토큰이 사라졌거나(만료) 이 challenge의 발송 한도(모든 수단 합쳐 5회)를 다 씀: 처음부터 다시 로그인하는
    // 것이 유일한 방법이라 토스트를 띄우고 시트를 닫는다. 발송 경로(카드, 다시 받기, 문자로 받기, 이메일 받기)는 모두 여기로 온다.
    if (error.code === 'CHALLENGE_EXPIRED' || error.code === 'OTP_SEND_LIMIT_EXCEEDED') {
      showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
      cancel();
      return;
    }
    presentError(error);
  };

  // 검증 실패: 칸을 비우고(포커스 이동 없음) 오류를 보인다. 너무 많이 틀려 잠기면(423) 공용 표시기가 `/account-locked`로 보낸다.
  // 다시 받기는 바로 열지 않는다: 서버가 준 `resendAfterSeconds` 타이머를 그대로 따른다.
  const handleVerifyError = (error: ApiError) => {
    if (error.code !== 'ACCOUNT_LOCKED') setAttempt((count) => count + 1);
    handleError(error);
  };

  const clearError = () => setError(null);
  const sendCode = useSendCode({ onMutate: clearError, onError: handleError });
  const verifyCode = useVerifyCode({ onMutate: clearError, onError: handleVerifyError });

  /**
   * 코드를 보낸다(같은 수단 재전송 포함). 성공하면 코드 입력으로 간다. 서버는 같은 수단 대기 시간 없이
   * 챌린지당 5회까지 바로 보내므로(카카오톡 -> 문자 -> 다시 카카오톡도 즉시), 앱도 수단별 대기나 "보낸 코드 재사용"을
   * 두지 않는다. 6번째는 429 `OTP_SEND_LIMIT_EXCEEDED`(`handleError`: 토스트 + 시트 닫기).
   */
  const send = (method: ChallengeMethod, { resend = false } = {}) =>
    runOnce((done) => {
      sendCode.mutate(
        { channel: method },
        {
          onSuccess: (result) => {
            const now = Date.now();
            // 다시 받기(코드 입력 화면에서 같은 수단): 새 `expiresAt`이 칸을 비우고 타이머를 처음부터 다시 센다. 확인 토스트를 띄운다.
            if (resend) showSuccessToast({ id: RESENT_TOAST_ID, title: t('auth.verify.resent') });
            setAttempt(0);
            setSent({
              method,
              destination: result.destination ?? null,
              expiresAt: now + result.expiresInSeconds * 1000,
              resendAt: now + result.resendAfterSeconds * 1000,
            });
          },
          onSettled: done,
        },
      );
    });

  const verify = (code: string) =>
    runOnce((done) =>
      verifyCode.mutate(
        { channel: sent?.method ?? 'TOTP', code },
        {
          onSuccess: (result) => {
            if (result.status === 'TEMP_PASSWORD_REQUIRED') router.replace('/temp-password');
            else if (result.passwordChangeRequired) router.replace('/password-change');
          },
          onSettled: done,
        },
      ),
    );

  return {
    step,
    sent,
    errorMessage,
    /** 코드 칸을 다시 마운트할 키의 일부(검증 실패마다 바뀜, 새 코드면 0). 0일 때만 칸이 자동 포커스된다. */
    attempt,
    sending: sendCode.isPending,
    /** 발송 요청 중인 수단(카드 스피너). */
    sendingMethod: sendCode.isPending ? (sendCode.variables?.channel ?? null) : null,
    verifying: verifyCode.isPending,
    /** 수단 카드·이메일 받기·다시 받기·문자로 받기 모두 새 코드를 보낸다. */
    send,
    /** 코드 입력 화면의 "다시 받기": 같은 수단으로 새 코드 + 확인 토스트. */
    resend: () => {
      if (sent) send(sent.method, { resend: true });
    },
    verify,
    cancel,
    // 네트워크는 없지만 발송·검증과 같은 잠금을 잠시 잡는다: 두 번째 탭이 다음 단계 버튼에 닿아 의도치 않게 코드를 보내지 않게.
    confirmDevice: () =>
      runOnce((done) => {
        setDeviceConfirmed(true);
        setTimeout(done, STEP_SETTLE_MS);
      }),
    clearError,
    isTotp,
    /** 서버가 코드 시간이 지났다고 거부함: 새 코드를 요청해야 한다(화면은 남은 시간 0초도 같은 상태로 본다). */
    expired: error?.code === 'OTP_EXPIRED',
    /** 받을 곳 다시 고르기(문자 코드 전용). 입력 중이던 코드는 버린다: 다음 카드 선택이 새 코드를 보낸다. */
    backToMethod: () => {
      setSent(null);
      clearError();
    },
  };
}
