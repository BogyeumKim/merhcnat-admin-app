import { Column, Row } from '@expo/ui';
import type { ReactNode } from 'react';

import { useTranslation } from '@/shared/i18n';
import { openSheet } from '@/shared/lib/open-sheet';
import { spacing, useNativeColors, useWindowLayout } from '@/shared/theme';
import { FILL_ROW } from '@/shared/ui/fill-row';
import { FormAlert } from '@/shared/ui/form-alert';
import { IconButton } from '@/shared/ui/icon-button';
import { icons } from '@/shared/ui/icons';
import { LinkText } from '@/shared/ui/link-text';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { CodeExpiry } from './code-expiry';
import { OtpCodeField } from './otp-code-field';
import { ResendButton } from './resend-button';
import { StepBars } from './step-bars';
import { TOP_BAR_GLYPH } from './top-bar';
import { useSecondsLeft } from '../hooks/use-seconds-left';
import { CODE_LENGTH } from '../model/forms';
import type { ChallengeMethod } from '../model/schemas';

type CodeEntryProps = {
  method: ChallengeMethod;
  /** 문자 코드 전용. 인증 앱(TOTP) 코드는 `null`. */
  destination: string | null;
  /** 확인 중: 6칸이 회색으로 잠기고 아래에 "확인하고 있어요". */
  pending: boolean;
  /** 서버가 코드 시간이 지났다고 거부함(남은 시간 0초와 같은 시간 초과 상태). */
  expired: boolean;
  /** 서버가 코드를 거부함(오류 등): 사용자가 다시 입력을 시작할 때까지 칸 아래에 표시. */
  serverError: string | null;
  /** 검증이 실패할 때마다 바뀐다: 칸을 다시 마운트해 비운다(포커스는 옮기지 않는다). 새 코드면 0. */
  attempt: number;
  onEdit: () => void;
  onSubmit: (code: string) => void;
  /** 발송된 코드의 만료 시각(epoch ms). 인증 앱 코드에는 표시하지 않는다. */
  expiresAt?: number;
  /** 문자 코드 전용. `availableAt`은 서버 `resendAfterSeconds` 기준(틀려도 앞당기지 않는다). */
  resend?: { availableAt: number; pending: boolean; onResend: () => void };
  /** 문자 코드 전용: 코드 받을 방식 선택으로 돌아간다(위쪽 뒤로). */
  onBack?: () => void;
  /** "다른 방법으로 받기"(이메일 도움 링크, 시간 초과): 고를 다른 수단이 있을 때만. */
  onOtherMethod?: () => void;
  /** 카카오톡 코드가 안 올 때 바로 문자로 다시 받기(서버가 SMS를 허용할 때만). */
  onSwitchToSms?: () => void;
  /** 상단 바 끝 X: 인증을 그만두고 시트를 닫는다. */
  onCancel: () => void;
};

/**
 * 디자인의 상단 바: 뒤로(<), 채워진 막대 2개와 "2 / 2"(앱 코드는 "2단계 인증"), 닫기(X).
 * 뒤로와 닫기는 44pt 아이콘 버튼(`IconButton`)이고 막대(`StepBars`)가 남는 폭을 채운다.
 * X는 그래버 스와이프의 한 번 탭 대안이다(WCAG 2.5.1).
 */
function CodeTopBar({ isTotp, onBack, onCancel }: { isTotp: boolean; onBack?: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  const back = onBack ? (
    <IconButton icon={icons.back} size={TOP_BAR_GLYPH} weight="medium" color={colors.text} testID="verify-back" label={t('auth.verify.back')} onPress={onBack} />
  ) : null;
  const close = (
    <IconButton icon={icons.close} size={TOP_BAR_GLYPH} weight="medium" color={colors.text} testID="verify-cancel" label={t('auth.verify.close')} onPress={onCancel} />
  );

  if (!isTotp) return <StepBars current={2} total={2} leading={back} trailing={close} />;
  return (
    <Row alignment="center" style={{ width: '100%' }}>
      {back}
      {/* 글이 남는 폭만 받아 줄바꿈된다: 큰 글꼴에서 X가 0 폭으로 밀려 사라지지 않게(`FILL_ROW`). */}
      <Column modifiers={FILL_ROW}>
        <NativeText variant="label">{t('auth.verify.twoStep')}</NativeText>
      </Column>
      {close}
    </Row>
  );
}

/** 안내 한 줄: "카카오톡으로 010-****-0000에 보냈어요", 이메일은 스팸함 안내까지(디자인 1-6). */
function useCodeHint(method: ChallengeMethod, destination: string | null) {
  const { t } = useTranslation();
  if (method === 'TOTP' || !destination) return t('auth.verify.codeHintTotp');
  if (method === 'EMAIL') return t('auth.verify.codeHintEmail', { destination });
  return t('auth.verify.codeHintSent', { via: t(method === 'KAKAO' ? 'auth.verify.viaKAKAO' : 'auth.verify.viaSMS'), destination });
}

/**
 * 코드 단계(디자인 1-6 ~ 1-8). 인증번호 6칸(`OtpCodeField`)이며 마지막 숫자를 입력하면 자동 제출된다(iOS 숫자 패드에는
 * Return 키가 없고 SMS 자동 완성이 6자리를 한 번에 채우므로) 확인 버튼이 없다.
 * - 확인 중: 칸 잠김 + "확인하고 있어요".
 * - 틀림: 칸을 비움(`attempt` 키, 포커스·커서는 옮기지 않음), 빨간 칸 + 칸 아래 빨간 글씨, 다시 받기는 서버 타이머 그대로.
 * - 시간 초과(남은 시간 0초 또는 서버 `OTP_EXPIRED`): 칸 비활성 + 빨간 글씨 + [인증번호 다시 받기] + "다른 방법으로 받기".
 * - 인증 앱(TOTP): 남은 시간·다시 받기 없이 "인증 앱을 쓸 수 없나요?" 하나.
 */
export function CodeEntry({
  method,
  destination,
  pending,
  expired,
  serverError,
  attempt,
  onEdit,
  onSubmit,
  expiresAt,
  resend,
  onBack,
  onOtherMethod,
  onSwitchToSms,
  onCancel,
}: CodeEntryProps) {
  const { t } = useTranslation();
  const isTotp = method === 'TOTP';
  const hint = useCodeHint(method, destination);
  // 타이머는 여기 하나: 0초가 되면 칸 잠금과 시간 초과 안내가 같은 값으로 바뀐다(인증 앱 코드는 만료 시각이 없다).
  const secondsLeft = useSecondsLeft(expiresAt ?? 0);
  const timedOut = expired || (expiresAt !== undefined && secondsLeft === 0);

  // 코드가 안 올 때의 바로가기(디자인): 카카오톡은 바로 문자로 보내고, 이메일은 받을 곳 다시 고르기, 인증 앱은 도움말(OTP 항목 펼침).
  // 문자는 두지 않는다(받을 곳 다시 고르기는 위쪽 뒤로 버튼).
  const help = isTotp
    ? { label: t('auth.verify.helpTotp'), onPress: () => void openSheet({ pathname: '/login-help', params: { open: 'otp' } }) }
    : method === 'KAKAO' && onSwitchToSms
      ? { label: t('auth.verify.helpNoCode'), onPress: onSwitchToSms }
      : method === 'EMAIL' && onOtherMethod
        ? { label: t('auth.verify.helpNoEmail'), onPress: onOtherMethod }
        : null;

  const submit = (value: string) => {
    if (!pending && !timedOut && value.length === CODE_LENGTH) onSubmit(value);
  };

  return (
    <SheetFormScreen grabber>
      <CodeTopBar isTotp={isTotp} onBack={onBack} onCancel={onCancel} />
      <Column spacing={spacing.sm} style={{ width: '100%' }}>
        <NativeText variant="title">{isTotp ? t('auth.verify.codeTitleTotp') : t('auth.verify.codeTitle')}</NativeText>
        <NativeText tone="secondary">{hint}</NativeText>
      </Column>
      <Column spacing={spacing.sm} style={{ width: '100%', paddingTop: spacing.sm }}>
        <NativeText variant="fieldLabel" tone="secondary">
          {isTotp ? t('auth.verify.codeLabelTotp') : t('auth.verify.codeLabel')}
        </NativeText>
        {/* 새 코드(`expiresAt` 변경)나 검증 실패(`attempt` 변경)마다 다시 마운트해 칸을 비운다.
            자동 포커스는 코드 단계에 처음 들어오거나 새 코드를 받았을 때(`attempt === 0`)만: 틀린 뒤에는 포커스를 옮기지 않는다. */}
        <OtpCodeField
          key={`${expiresAt ?? 0}:${attempt}`}
          testID="otp-code"
          autoFocus={attempt === 0}
          accessibilityLabel={isTotp ? t('auth.verify.codeLabelTotp') : t('auth.verify.codeLabel')}
          invalid={Boolean(serverError) && !timedOut}
          locked={pending}
          disabled={timedOut}
          onChange={(code) => {
            onEdit();
            submit(code);
          }}
        />
        {timedOut ? (
          <TimedOut resend={resend} onOtherMethod={onOtherMethod} />
        ) : (
          <>
            {serverError ? <FormAlert message={serverError} /> : null}
            {pending ? (
              <NativeText variant="subhead" tone="secondary">
                {t('auth.verify.verifying')}
              </NativeText>
            ) : null}
            {/* 남은 시간 + 다시 받기(인증 앱 코드에는 둘 다 없다). */}
            {expiresAt !== undefined || resend ? (
              <ExpiryRow
                expiry={expiresAt !== undefined ? <CodeExpiry secondsLeft={secondsLeft} /> : null}
                resend={resend ? <ResendButton key={resend.availableAt} availableAt={resend.availableAt} pending={resend.pending} onResend={resend.onResend} /> : null}
              />
            ) : null}
          </>
        )}
      </Column>
      {help && !timedOut ? (
        <LinkText testID="verify-help" onPress={help.onPress}>
          {help.label}
        </LinkText>
      ) : null}
    </SheetFormScreen>
  );
}

/**
 * 남은 시간(왼쪽) + 다시 받기(오른쪽). 남은 시간은 `FILL_ROW`로 남는 폭만 받아 줄바꿈된다(다시 받기가 0 폭으로 밀리지 않게).
 * 큰 글꼴(`isLargeText`)에서는 두 문구가 한 줄에 들어가지 않으므로 위아래로 쌓는다(Compose `Row`는 앞 자식이 폭을 먼저 가져간다).
 */
function ExpiryRow({ expiry, resend }: { expiry: ReactNode; resend: ReactNode }) {
  const { isLargeText } = useWindowLayout();

  if (isLargeText) {
    return (
      <Column alignment="start" spacing={spacing.xs} style={{ width: '100%' }}>
        {expiry}
        {resend}
      </Column>
    );
  }
  return (
    <Row alignment="center" spacing={spacing.sm} style={{ width: '100%' }}>
      <Column modifiers={FILL_ROW}>{expiry}</Column>
      {resend}
    </Row>
  );
}

/** 시간 초과(디자인 1-7): 빨간 글씨 아래 [인증번호 다시 받기] 버튼과 "다른 방법으로 받기" 링크. */
function TimedOut({ resend, onOtherMethod }: Pick<CodeEntryProps, 'resend' | 'onOtherMethod'>) {
  const { t } = useTranslation();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      <FormAlert message={t('errors.OTP_EXPIRED')} />
      {resend ? (
        <NativeButton testID="otp-resend-expired" label={t('auth.verify.resend')} loading={resend.pending} disabled={resend.pending} onPress={resend.onResend} />
      ) : null}
      {onOtherMethod ? (
        <Column alignment="center" style={{ width: '100%' }}>
          <LinkText testID="verify-other-method" onPress={onOtherMethod}>
            {t('auth.verify.otherMethod')}
          </LinkText>
        </Column>
      ) : null}
    </Column>
  );
}
