import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { openSheet } from '@/shared/lib/open-sheet';
import { spacing, useNativeColors } from '@/shared/theme';
import { FormAlert } from '@/shared/ui/form-alert';
import { IconButton } from '@/shared/ui/icon-button';
import { icons } from '@/shared/ui/icons';
import { LinkText } from '@/shared/ui/link-text';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { CodeExpiry } from './code-expiry';
import { OtpCodeField } from './otp-code-field';
import { ResendButton } from './resend-button';
import { StepBars } from './step-bars';
import { TOP_BAR_GLYPH } from './top-bar';
import { CODE_LENGTH } from '../model/forms';
import type { ChallengeMethod } from '../model/schemas';

type CodeEntryProps = {
  method: ChallengeMethod;
  /** 문자 코드 전용. 인증 앱(TOTP) 코드는 `null`. */
  destination: string | null;
  pending: boolean;
  /** 코드 시간이 만료됨: 새 코드를 요청해야 한다. */
  expired: boolean;
  /** 서버가 코드를 거부함(오류, 만료, 잠김): 사용자가 수정할 때까지 입력란 아래에 표시. */
  serverError: string | null;
  onEdit: () => void;
  onSubmit: (code: string) => void;
  /** 발송된 코드의 만료 시각(epoch ms). 인증 앱 코드에는 표시하지 않는다. */
  expiresAt?: number;
  /** 문자 코드 전용. */
  resend?: { availableAt: number; pending: boolean; onResend: () => void };
  /** 문자 코드 전용: 코드 받을 방식 선택으로 돌아간다. */
  onBack?: () => void;
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
      <NativeText variant="label">{t('auth.verify.twoStep')}</NativeText>
      <Spacer flexible />
      {close}
    </Row>
  );
}

/**
 * 코드 단계(디자인). 인증번호 6칸(`OtpCodeField`)이며 마지막 숫자를 입력하면 자동 제출된다(iOS 숫자 패드에는
 * Return 키가 없고 SMS 자동 완성이 6자리를 한 번에 채우므로) 확인 버튼이 없다.
 */
export function CodeEntry({
  method,
  destination,
  pending,
  expired,
  serverError,
  onEdit,
  onSubmit,
  expiresAt,
  resend,
  onBack,
  onSwitchToSms,
  onCancel,
}: CodeEntryProps) {
  const { t } = useTranslation();
  const isTotp = method === 'TOTP';
  const hint = isTotp || !destination
    ? t('auth.verify.codeHintTotp')
    : method === 'EMAIL'
      ? t('auth.verify.codeHintEmail', { destination })
      : t('auth.verify.codeHintSent', { via: t(method === 'KAKAO' ? 'auth.verify.viaKAKAO' : 'auth.verify.viaSMS'), destination });
  // 코드가 안 올 때의 바로가기: 카카오톡은 바로 문자로 보내고(디자인), 인증 앱은 도움말.
  // 문자·이메일은 따로 두지 않는다: 받을 곳 다시 고르기는 위쪽 뒤로 버튼 하나로만 한다(같은 동작 링크가 둘이면 헷갈린다).
  const help = isTotp
    ? { label: t('auth.verify.helpTotp'), onPress: () => void openSheet({ pathname: '/login-help', params: { open: 'otp' } }) }
    : method === 'KAKAO' && onSwitchToSms
      ? { label: t('auth.verify.helpNoCode'), onPress: onSwitchToSms }
      : null;

  const submit = (value: string) => {
    if (!pending && value.length === CODE_LENGTH) onSubmit(value);
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
        {/* 새 코드를 받으면(`expiresAt` 변경) 이전 코드로 채운 칸을 비운다. */}
        <OtpCodeField
          key={expiresAt}
          testID="otp-code"
          accessibilityLabel={isTotp ? t('auth.verify.codeLabelTotp') : t('auth.verify.codeLabel')}
          invalid={Boolean(serverError) || expired}
          onChange={(code) => {
            onEdit();
            submit(code);
          }}
        />
        {serverError ? <FormAlert message={serverError} /> : null}
        {/* 남은 시간 + 다시 받기: 만료돼도 버튼으로 바뀌지 않고 같은 줄에서 "다시 받기" 링크가 바로 활성화된다. */}
        <Row alignment="center" style={{ width: '100%' }}>
          {expiresAt ? <CodeExpiry key={expiresAt} expiresAt={expiresAt} /> : null}
          <Spacer flexible />
          {resend ? (
            <ResendButton key={resend.availableAt} availableAt={resend.availableAt} pending={resend.pending} onResend={resend.onResend} />
          ) : null}
        </Row>
      </Column>
      {pending ? <NativeText tone="secondary">{t('auth.verify.verifying')}</NativeText> : null}
      {help ? (
        <LinkText testID="verify-help" onPress={help.onPress}>
          {help.label}
        </LinkText>
      ) : null}
    </SheetFormScreen>
  );
}
