import { Row, Spacer } from '@expo/ui';
import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeField } from '@/shared/ui/native-field';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { CodeExpiry } from './code-expiry';
import { ResendButton } from './resend-button';
import { StepHeader } from './step-header';
import { CODE_LENGTH } from '../model/forms';

type CodeEntryProps = {
  /** Masked destination for message codes; `null` for an authenticator-app (TOTP) code. */
  destination: string | null;
  pending: boolean;
  /** Server rejected the code (wrong, expired, locked): shown under the field until the user edits it. */
  serverError: string | null;
  onEdit: () => void;
  onSubmit: (code: string) => void;
  /** Epoch ms when the sent code expires. Not shown for an authenticator-app code. */
  expiresAt?: number;
  /** Message codes only. */
  resend?: { availableAt: number; pending: boolean; onResend: () => void };
  onCancel: () => void;
};

/**
 * The code step. One field with large, widely spaced digits (the layout follows the system text size for everything
 * else). The last digit submits by itself: the iOS number pad has no Return key, and an SMS auto-fill fills all six
 * at once. React state only knows whether the field is complete, never the digits.
 */
export function CodeEntry({ destination, pending, serverError, onEdit, onSubmit, expiresAt, resend, onCancel }: CodeEntryProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const complete = code.length === CODE_LENGTH;

  const submit = (value: string) => {
    if (!pending && value.length === CODE_LENGTH) onSubmit(value);
  };

  return (
    <SheetFormScreen
      footer={
        <>
          <NativeButton
            testID="otp-submit"
            label={pending ? t('auth.verify.verifying') : t('auth.verify.verify')}
            disabled={!complete || pending}
            onPress={() => submit(code)}
          />
          <NativeButton testID="verify-cancel" label={t('common.cancel')} variant="text" disabled={pending} onPress={onCancel} />
        </>
      }>
      <StepHeader
        title={t('auth.verify.codeTitle')}
        body={destination ? t('auth.verify.codeHintSent', { destination }) : t('auth.verify.codeHintTotp')}
      />
      <NativeField
        testID="otp-code"
        accessibilityLabel={t('auth.verify.codeLabel')}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        autoFocus
        maxLength={CODE_LENGTH}
        autoCorrect={false}
        textAlign="center"
        textStyle={{ fontSize: 28, fontWeight: '600', letterSpacing: 12 }}
        invalid={Boolean(serverError)}
        onChangeText={(text) => {
          setCode(text);
          onEdit();
          submit(text);
        }}
      />
      {serverError ? <NativeText variant="subhead" tone="danger">{serverError}</NativeText> : null}
      <Row alignment="center" style={{ width: '100%' }}>
        {expiresAt ? <CodeExpiry key={expiresAt} expiresAt={expiresAt} /> : null}
        <Spacer flexible />
        {resend ? (
          <ResendButton
            key={resend.availableAt}
            availableAt={resend.availableAt}
            pending={resend.pending}
            onResend={resend.onResend}
          />
        ) : null}
      </Row>
    </SheetFormScreen>
  );
}
