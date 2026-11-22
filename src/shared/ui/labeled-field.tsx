import { Column, Row, type TextInputProps } from '@expo/ui';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';

import { FormAlert } from './form-alert';
import { NativeField } from './native-field';
import { NativeText } from './native-text';
import { PasswordToggle } from './password-toggle';

type LabeledFieldProps = TextInputProps & {
  label: string;
  /** 번역된 필드 단위 오류. 필드 바로 아래에 표시한다. */
  error?: string | null;
  /** 필드 끝의 컨트롤 (예: "지우기"). 보안 필드는 그 뒤에 눈 모양 토글을 둔다. */
  trailing?: ReactElement;
};

/**
 * 항상 보이는 라벨이 위에 있고 인라인 오류 자리가 있는 필드. placeholder는 예시 값일 뿐(또는 없음)이므로
 *  라벨을 접근성 이름으로도 전달한다. 보안 필드는 끝에 눈 아이콘이 붙는다(토글해도 포커스·키보드 유지: `NativeFieldBase`).
 *  `error`는 입력란 아래 빨간 문장으로만 보인다(입력란 자체는 칠하지 않는다).
 */
export function LabeledField({ label, error, secureTextEntry, trailing, ...props }: LabeledFieldProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  // 보이게 해 둔 비밀번호는 앱이 백그라운드로 가면(앱 전환기 스냅숏 포함: iOS `inactive`) 다시 가린다(스펙 1-1).
  useEffect(() => {
    if (!secureTextEntry || !revealed) return undefined;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setRevealed(false);
    });
    return () => subscription.remove();
  }, [secureTextEntry, revealed]);

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      <NativeText variant="fieldLabel" tone="secondary">
        {label}
      </NativeText>
      <NativeField
        accessibilityLabel={label}
        invalid={Boolean(error)}
        secureTextEntry={secureTextEntry && !revealed}
        trailing={
          secureTextEntry ? (
            <Row alignment="center">
              {trailing}
              <PasswordToggle
                revealed={revealed}
                label={revealed ? t('auth.hidePassword') : t('auth.showPassword')}
                onPress={() => setRevealed((value) => !value)}
              />
            </Row>
          ) : (
            trailing
          )
        }
        {...props}
      />
      {error ? <FormAlert message={error} /> : null}
    </Column>
  );
}
