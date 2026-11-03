import ChevronLeft from '@expo/material-symbols/chevron_left.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';
import { router } from 'expo-router';
import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { FormAlert } from '@/shared/ui/form-alert';
import { LinkText } from '@/shared/ui/link-text';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeField } from '@/shared/ui/native-field';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { CodeExpiry } from './code-expiry';
import { ResendButton } from './resend-button';
import { StepBars } from './step-bars';
import { CODE_LENGTH } from '../model/forms';
import type { ChallengeMethod } from '../model/schemas';

type CodeEntryProps = {
  method: ChallengeMethod;
  /** Message codes only; `null` for an authenticator-app (TOTP) code. */
  destination: string | null;
  pending: boolean;
  /** The code ran out of time: a new one has to be requested. */
  expired: boolean;
  /** Server rejected the code (wrong, expired, locked): shown under the field until the user edits it. */
  serverError: string | null;
  onEdit: () => void;
  onSubmit: (code: string) => void;
  /** Epoch ms when the sent code expires. Not shown for an authenticator-app code. */
  expiresAt?: number;
  /** Message codes only. */
  resend?: { availableAt: number; pending: boolean; onResend: () => void };
  /** Message codes only: back to choosing where to get the code. */
  onBack?: () => void;
  onCancel: () => void;
};

const BACK_BUTTON = 48;
const CLOSE_BUTTON = 64;

/** The top bar of the design: back, the two filled bars with "2 / 2단계" (or "2단계 인증" for an app code), and close. */
function CodeTopBar({ isTotp, onBack, onCancel }: { isTotp: boolean; onBack?: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Row alignment="center" style={{ width: '100%' }}>
      {onBack ? (
        <Column testID="verify-back" onPress={onBack} style={{ padding: spacing.sm + spacing.xs }}>
          <Icon name={{ ios: 'chevron.left', android: ChevronLeft }} size={24} color={colors.text} accessibilityLabel={t('auth.verify.back')} />
        </Column>
      ) : null}
      {isTotp ? (
        <NativeText variant="label">{t('auth.verify.twoStep')}</NativeText>
      ) : (
        <StepBars current={2} total={2} reserve={(onBack ? BACK_BUTTON : 0) + CLOSE_BUTTON} />
      )}
      <Spacer flexible />
      <Column testID="verify-cancel" onPress={onCancel} style={{ padding: spacing.sm + spacing.xs }}>
        <NativeText variant="label" tone="secondary">
          {t('auth.verify.close')}
        </NativeText>
      </Column>
    </Row>
  );
}

/**
 * The code step. One boxed field with large, widely spaced digits; the last digit submits by itself (the iOS number pad
 * has no Return key and an SMS auto-fill fills all six at once), so there is no confirm button. React state only knows
 * whether the field is complete, never the digits.
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
  onCancel,
}: CodeEntryProps) {
  const { t } = useTranslation();
  const isTotp = method === 'TOTP';
  const [, setLength] = useState(0);

  const submit = (value: string) => {
    if (!pending && value.length === CODE_LENGTH) onSubmit(value);
  };

  return (
    <SheetFormScreen>
      <CodeTopBar isTotp={isTotp} onBack={onBack} onCancel={onCancel} />
      <Column spacing={spacing.sm} style={{ width: '100%' }}>
        <NativeText variant="title">{isTotp ? t('auth.verify.codeTitleTotp') : t('auth.verify.codeTitle')}</NativeText>
        <NativeText tone="secondary">
          {isTotp
            ? t('auth.verify.codeHintTotp')
            : destination
              ? t('auth.verify.codeHintSent', { via: t(`auth.verify.via${method === 'KAKAO' ? 'KAKAO' : 'SMS'}`), destination })
              : t('auth.verify.codeHintTotp')}
        </NativeText>
      </Column>
      <Column spacing={spacing.sm} style={{ width: '100%', paddingTop: spacing.sm }}>
        <NativeText variant="fieldLabel" tone="secondary">
          {isTotp ? t('auth.verify.codeLabelTotp') : t('auth.verify.codeLabel')}
        </NativeText>
        <NativeField
          testID="otp-code"
          accessibilityLabel={t('auth.verify.codeLabel')}
          placeholder="••••••"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          autoFocus
          maxLength={CODE_LENGTH}
          autoCorrect={false}
          textAlign="center"
          textStyle={{ fontSize: 28, fontWeight: '600', letterSpacing: 12 }}
          invalid={Boolean(serverError) || expired}
          onChangeText={(text) => {
            setLength(text.length);
            onEdit();
            submit(text);
          }}
        />
        {serverError ? <FormAlert message={serverError} /> : null}
        {expired ? null : (
          <Row alignment="center" style={{ width: '100%' }}>
            {expiresAt ? <CodeExpiry key={expiresAt} expiresAt={expiresAt} /> : null}
            <Spacer flexible />
            {resend ? (
              <ResendButton key={resend.availableAt} availableAt={resend.availableAt} pending={resend.pending} onResend={resend.onResend} />
            ) : null}
          </Row>
        )}
      </Column>
      {expired && resend ? (
        <Column spacing={spacing.sm} style={{ width: '100%' }}>
          <NativeButton testID="otp-resend" label={t('auth.verify.resend')} onPress={resend.onResend} disabled={resend.pending} />
          {onBack ? (
            <NativeButton testID="otp-other-method" variant="text" label={t('auth.verify.otherMethod')} onPress={onBack} />
          ) : null}
        </Column>
      ) : null}
      {pending ? <NativeText tone="secondary">{t('auth.verify.verifying')}</NativeText> : null}
      <LinkText
        testID="verify-help"
        onPress={() => (isTotp ? router.push({ pathname: '/login-help', params: { open: 'otp' } }) : onBack?.())}>
        {isTotp ? t('auth.verify.helpTotp') : t('auth.verify.helpNoCode')}
      </LinkText>
    </SheetFormScreen>
  );
}
