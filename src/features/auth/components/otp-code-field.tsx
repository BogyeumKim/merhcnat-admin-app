import { Column, TextInput, type TextInputRef } from '@expo/ui';
import { useRef } from 'react';

import { OtpBoxes } from './otp-boxes';
import type { OtpCodeFieldProps } from './otp-code-field.types';
import { OTP_BOX_HEIGHT, useOtpCodeField } from '../hooks/use-otp-code-field';
import { CODE_LENGTH } from '../model/forms';

/** 플랫폼 중립 폴백(iOS/Android는 칸 위에 입력란을 겹치는 각자 파일이 쓰인다): 칸 아래에 입력란을 둔다. */
export function OtpCodeField({ invalid, locked, disabled, autoFocus, accessibilityLabel, testID, onChange }: OtpCodeFieldProps) {
  const inputRef = useRef<TextInputRef>(null);
  const field = useOtpCodeField(onChange, locked, inputRef);

  return (
    <Column style={{ width: '100%' }}>
      <OtpBoxes value={field.value} focused={field.focused} invalid={invalid} inactive={locked || disabled} />
      <TextInput
        ref={inputRef}
        testID={testID}
        placeholder={accessibilityLabel}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        maxLength={CODE_LENGTH}
        style={{ width: '100%', height: OTP_BOX_HEIGHT }}
        editable={!disabled}
        onChangeText={field.change}
        onSelectionChange={field.selectionChange}
        onFocus={field.onFocus}
        onBlur={field.onBlur}
      />
    </Column>
  );
}
