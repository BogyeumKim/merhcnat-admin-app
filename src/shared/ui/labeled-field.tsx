import { Column, Row, type TextInputProps } from '@expo/ui';
import type { ReactElement } from 'react';
import { useState } from 'react';

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
 *  라벨을 접근성 이름으로도 전달한다. 보안 필드는 끝에 눈 아이콘이 붙는다.
 */
export function LabeledField({ label, error, secureTextEntry, trailing, ...props }: LabeledFieldProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

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
