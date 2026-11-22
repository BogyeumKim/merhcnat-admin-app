import { TextInput } from '@expo/ui';
import { Box } from '@expo/ui/jetpack-compose';
import { alpha, fillMaxWidth, height } from '@expo/ui/jetpack-compose/modifiers';

import { OtpBoxes } from './otp-boxes';
import type { OtpCodeFieldProps } from './otp-code-field.types';
import { OTP_BOX_HEIGHT, useOtpCodeField } from '../hooks/use-otp-code-field';
import { CODE_LENGTH } from '../model/forms';

/**
 * Android: Compose `Box`로 칸 위에 입력란을 겹친다. `alpha(0)`은 그리기만 막고 터치·입력은 그대로 받으므로
 * 칸 어디를 눌러도 입력란에 포커스가 가고 키보드가 열린다.
 * 겹침 영역과 입력란은 칸 행과 같은 영역(부모 폭 × 칸 높이)을 채운다: 창 폭으로 계산하면 폼 시트 폭과 어긋난다.
 */
export function OtpCodeField({ invalid, accessibilityLabel, testID, onChange }: OtpCodeFieldProps) {
  const field = useOtpCodeField(onChange);

  return (
    <Box modifiers={[fillMaxWidth(), height(OTP_BOX_HEIGHT)]}>
      <OtpBoxes value={field.value} focused={field.focused} invalid={invalid} />
      <TextInput
        testID={testID}
        placeholder={accessibilityLabel}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        autoFocus
        maxLength={CODE_LENGTH}
        onChangeText={field.change}
        onFocus={field.onFocus}
        onBlur={field.onBlur}
        modifiers={[fillMaxWidth(), height(OTP_BOX_HEIGHT), alpha(0)]}
      />
    </Box>
  );
}
