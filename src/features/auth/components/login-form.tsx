import { Row, Spacer } from '@expo/ui';
import { Controller } from 'react-hook-form';

import { useValidationMessage } from '@/shared/forms/validation';
import { useTranslation } from '@/shared/i18n';
import { openSheet } from '@/shared/lib/open-sheet';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { ClearButton } from '@/shared/ui/clear-button';
import { FormAlert } from '@/shared/ui/form-alert';
import { LabeledField } from '@/shared/ui/labeled-field';
import { LinkText } from '@/shared/ui/link-text';
import { NativeButton } from '@/shared/ui/native-button';

import { useLoginForm } from '../hooks/use-login-form';
import { PASSWORD_MAX_LENGTH, USER_ID_MAX_LENGTH, type LoginValues } from '../model/forms';

/**
 * 아이디 칸은 영문 키보드로 연다. iOS `ascii-capable`은 영문 자판을 띄운다. Android universal 매핑은 `ascii-capable`을
 * 일반 `text`로 바꿔 한글 자판이 그대로 남으므로, 영문 자판으로 시작하는 이메일 자판을 쓴다.
 */
const USER_ID_KEYBOARD = process.env.EXPO_OS === 'ios' ? 'ascii-capable' : 'email-address';

type LoginFormProps = {
  pending: boolean;
  /** 서버가 준 폼 단위 지속 오류(예: ID 또는 비밀번호 오류). */
  formError: string | null;
  /** 값을 올리면 비밀번호 입력란을 비우고 그 칸에 포커스한다(로그인 거부 후). 마운트 시점 값은 무시한다. */
  passwordResetKey: number;
  onSubmit: (input: LoginValues) => void;
  /** 사용자가 입력을 고치기 시작함(폼 오류를 지운다). */
  onEdit: () => void;
};

/** Korpay 디자인의 로그인 화면 본문. 상태와 동작은 `useLoginForm`에 있고 여기서는 그리기만 한다. */
export function LoginForm({ pending, formError, passwordResetKey, onSubmit, onEdit }: LoginFormProps) {
  const { t } = useTranslation();
  const messageOf = useValidationMessage();
  const {
    control,
    userIdRef,
    passwordRef,
    hasUserId,
    hasPassword,
    canSubmit,
    submit,
    clearUserId,
    clearPassword,
    changeUserId,
    changePassword,
  } = useLoginForm({ pending, passwordResetKey, onSubmit, onEdit });

  // 모든 창 크기에서 같은 배치: 버튼은 하단 고정(`footer`), 도움말은 비밀번호 칸 바로 아래 오른쪽.
  const submitButton = (
    <NativeButton
      testID="login-submit"
      label={t('auth.signIn')}
      // 요청 중에는 버튼 안 스피너(`loading`)가 탭을 막는다. 비활성(회색)은 칸이 비었을 때만.
      loading={pending}
      disabled={!canSubmit}
      onPress={() => void submit()}
    />
  );

  return (
    <BrandedFormScreen tagline footer={submitButton}>
      <Controller
        control={control}
        name="userId"
        render={({ field, fieldState }) => (
          <>
          <LabeledField
            ref={(instance) => {
              field.ref(instance);
              userIdRef.current = instance;
            }}
            testID="login-user-id"
            maxLength={USER_ID_MAX_LENGTH}
            label={t('auth.userId')}
            placeholder={t('auth.userIdPlaceholder')}
            editable={!pending}
            keyboardType={USER_ID_KEYBOARD}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onChangeText={(text) => {
              changeUserId(text);
              field.onChange(text);
            }}
            onBlur={field.onBlur}
            onSubmitEditing={() => passwordRef.current?.focus()}
            trailing={
              hasUserId ? (
                <ClearButton testID="login-clear-user-id" label={t('auth.clearUserId')} onPress={clearUserId} />
              ) : undefined
            }
          />
          <FieldMessage message={messageOf(fieldState.error)} />
          </>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <>
          <LabeledField
            ref={(instance) => {
              field.ref(instance);
              passwordRef.current = instance;
            }}
            testID="login-password"
            maxLength={PASSWORD_MAX_LENGTH}
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            editable={!pending}
            secureTextEntry
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onChangeText={(text) => {
              changePassword(text);
              field.onChange(text);
            }}
            onBlur={field.onBlur}
            onSubmitEditing={() => void submit()}
            trailing={
              hasPassword ? (
                <ClearButton testID="login-clear-password" label={t('auth.clearPassword')} onPress={clearPassword} />
              ) : undefined
            }
          />
          {/* 자격 증명 오류: 비밀번호 칸 아래(버튼 위) 빨간 글씨. */}
          <FieldMessage message={formError ?? messageOf(fieldState.error)} />
          </>
        )}
      />
      <Row alignment="center" style={{ width: '100%' }}>
        <Spacer flexible />
        <LinkText testID="login-help" onPress={() => void openSheet('/login-help')}>
          {t('auth.loginHelp')}
        </LinkText>
      </Row>
    </BrandedFormScreen>
  );
}

/**
 * 로그인 오류 문구. `LabeledField error`를 쓰지 않는다: 디자인 1-2는 입력칸에 빨간 테두리를 넣지 않고
 * 칸 아래 빨간 글씨(아이콘 + 문장, 색에만 의존하지 않음)만 보인다.
 */
function FieldMessage({ message }: { message: string | null }) {
  return message ? <FormAlert message={message} /> : null;
}
