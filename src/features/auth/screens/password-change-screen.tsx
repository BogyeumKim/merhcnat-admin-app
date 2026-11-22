import { Column } from '@expo/ui';
import { Controller } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { LabeledField } from '@/shared/ui/labeled-field';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { PlainFormScreen } from '@/shared/ui/plain-form-screen';
import { StatusHeader } from '@/shared/ui/status-header';

import { PasswordRulesList } from '../components/password-rules';
import { usePasswordChange, type PasswordChangeCopy } from '../hooks/use-password-change';
import { PASSWORD_MAX_LENGTH } from '../model/forms';
import type { PasswordChangeVariant } from '../mutations/use-change-password';

const TITLE_KEY = {
  temporary: 'auth.tempPassword.title',
  expired: 'auth.passwordChange.title',
  voluntary: 'auth.passwordChange.voluntaryTitle',
} as const satisfies Record<PasswordChangeCopy, string>;

const BODY_KEY = {
  temporary: 'auth.tempPassword.body',
  expired: 'auth.passwordChange.body',
  voluntary: 'auth.passwordChange.voluntaryBody',
} as const satisfies Record<PasswordChangeCopy, string>;

/**
 * 비밀번호 변경 화면(세 흐름 공용): 90일 만료로 로그인 직후(`expired`, 서버가 "나중에"를 허용하지 않으면 넘어갈 수 없음),
 * 임시비밀번호·만료로 로그인 전(`temporary`, 문구는 서버 `reason`), 설정에서 스스로 변경(`voluntary`).
 * 레이아웃은 Korpay 디자인을 따르며, 현재 비밀번호 입력란만 서버가 요구해서 추가된 것이다.
 */
export default function PasswordChangeScreen({ variant = 'expired' }: { variant?: PasswordChangeVariant }) {
  const { t } = useTranslation();
  const {
    control,
    copy,
    rules,
    matches,
    mismatch,
    currentError,
    newError,
    canSubmit,
    pending,
    submit,
    changeCurrent,
    changeNew,
    focusNew,
    focusConfirm,
    skip,
    leave,
  } = usePasswordChange(variant);

  return (
    <PlainFormScreen
      footer={
        <>
          <NativeButton
            testID="password-change-submit"
            label={t('auth.passwordChange.submit')}
            disabled={!canSubmit}
            onPress={submit}
          />
          {skip ? <NativeButton testID="password-change-later" variant="text" label={t('auth.passwordChange.later')} disabled={pending} onPress={skip} /> : null}
          {leave ? (
            <NativeButton
              testID="password-change-back"
              variant="text"
              label={variant === 'voluntary' ? t('common.cancel') : t('auth.tempPassword.back')}
              disabled={pending}
              onPress={leave}
            />
          ) : null}
        </>
      }>
      <Column style={{ width: '100%', paddingTop: spacing.lg }}>
        <StatusHeader
          tone="action"
          icon={icons.lockReset}
          title={t(TITLE_KEY[copy])}
          body={t(BODY_KEY[copy])}
        />
      </Column>
      <Controller
        control={control}
        name="currentPassword"
        render={({ field }) => (
          <LabeledField
            ref={field.ref}
            testID="password-change-current"
            label={copy === 'temporary' ? t('auth.tempPassword.current') : t('auth.passwordChange.current')}
            error={currentError}
            maxLength={PASSWORD_MAX_LENGTH}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onChangeText={(text) => {
              changeCurrent();
              field.onChange(text);
            }}
            onBlur={field.onBlur}
            onSubmitEditing={focusNew}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field }) => (
          <Column spacing={spacing.sm} style={{ width: '100%' }}>
            <LabeledField
              ref={field.ref}
              testID="password-change-new"
              label={t('auth.passwordChange.new')}
              error={newError}
              maxLength={PASSWORD_MAX_LENGTH}
              secureTextEntry
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onChangeText={(text) => {
                changeNew();
                field.onChange(text);
              }}
              onBlur={field.onBlur}
              onSubmitEditing={focusConfirm}
            />
            <PasswordRulesList rules={rules} />
          </Column>
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <Column spacing={spacing.sm} style={{ width: '100%' }}>
            <LabeledField
              ref={field.ref}
              testID="password-change-confirm"
              label={t('auth.passwordChange.confirm')}
              maxLength={PASSWORD_MAX_LENGTH}
              secureTextEntry
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={submit}
            />
            {matches || mismatch ? (
              <NativeText variant="caption" tone={matches ? 'default' : 'danger'}>
                {matches ? t('auth.passwordChange.match') : t('auth.passwordChange.mismatch')}
              </NativeText>
            ) : null}
          </Column>
        )}
      />
    </PlainFormScreen>
  );
}
