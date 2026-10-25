import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { useValidationMessage } from '@/shared/forms/validation';
import { useTranslation } from '@/shared/i18n';
import { LabeledField } from '@/shared/ui/labeled-field';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import { ResendButton } from './resend-button';
import { CODE_LENGTH, codeSchema, type CodeValues } from '../model/forms';

type CodeEntryProps = {
  /** Masked destination for message codes; `null` for an authenticator-app (TOTP) code. */
  destination: string | null;
  pending: boolean;
  /** Server rejected the code (wrong, expired, locked): shown under the field until the user edits it. */
  serverError: string | null;
  onEdit: () => void;
  onSubmit: (code: string) => void;
  onResend?: () => void;
  resendPending?: boolean;
  onCancel: () => void;
};

export function CodeEntry({
  destination,
  pending,
  serverError,
  onEdit,
  onSubmit,
  onResend,
  resendPending = false,
  onCancel,
}: CodeEntryProps) {
  const { t } = useTranslation();
  const messageOf = useValidationMessage();

  const { control, handleSubmit } = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const submit = handleSubmit(({ code }) => {
    if (!pending) onSubmit(code);
  });

  return (
    <>
      <NativeText variant="title">{t('auth.verify.codeTitle')}</NativeText>
      <NativeText tone="secondary">
        {destination ? t('auth.verify.codeHintSent', { destination }) : t('auth.verify.codeHintTotp')}
      </NativeText>
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <LabeledField
            ref={field.ref}
            label={t('auth.verify.codeLabel')}
            error={messageOf(fieldState.error) ?? serverError}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            autoCorrect={false}
            textAlign="center"
            onBlur={field.onBlur}
            // The iOS number pad has no Return key, so the last digit (typed or auto-filled from an SMS) submits.
            onChangeText={(text) => {
              field.onChange(text);
              onEdit();
              if (text.length === CODE_LENGTH) void submit();
            }}
          />
        )}
      />
      <NativeButton
        label={pending ? t('auth.verify.verifying') : t('auth.verify.verify')}
        disabled={pending}
        onPress={() => void submit()}
      />
      {onResend ? <ResendButton onResend={onResend} pending={resendPending} /> : null}
      <NativeButton
        label={t('auth.verify.useAnotherAccount')}
        variant="text"
        disabled={pending}
        onPress={onCancel}
      />
    </>
  );
}
