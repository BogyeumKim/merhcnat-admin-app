import { Column, TextInput } from '@expo/ui';

import { OtpBoxes } from './otp-boxes';
import type { OtpCodeFieldProps } from './otp-code-field.types';
import { OTP_BOX_HEIGHT, useOtpCodeField } from '../hooks/use-otp-code-field';
import { CODE_LENGTH } from '../model/forms';

/** 플랫폼 중립 폴백(iOS/Android는 칸 위에 입력란을 겹치는 각자 파일이 쓰인다): 칸 아래에 입력란을 둔다. */
export function OtpCodeField({ invalid, accessibilityLabel, testID, onChange }: OtpCodeFieldProps) {
  const field = useOtpCodeField(onChange);

  return (
    <Column style={{ width: '100%' }}>
      <OtpBoxes value={field.value} focused={field.focused} invalid={invalid} />
      <TextInput
        testID={testID}
        placeholder={accessibilityLabel}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        autoFocus
        maxLength={CODE_LENGTH}
        style={{ width: '100%', height: OTP_BOX_HEIGHT }}
        onChangeText={field.change}
        onFocus={field.onFocus}
        onBlur={field.onBlur}
      />
    </Column>
  );
}
