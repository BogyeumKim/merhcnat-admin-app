import { TextInput, type TextInputRef } from '@expo/ui';
import { ZStack } from '@expo/ui/swift-ui';
import { accessibilityLabel as a11yLabel, frame, opacity } from '@expo/ui/swift-ui/modifiers';
import { useRef } from 'react';

import { OtpBoxes } from './otp-boxes';
import type { OtpCodeFieldProps } from './otp-code-field.types';
import { OTP_BOX_HEIGHT, useOtpCodeField } from '../hooks/use-otp-code-field';
import { CODE_LENGTH } from '../model/forms';

/**
 * iOS: SwiftUI `ZStack`으로 칸 위에 입력란을 겹친다. 입력란은 거의 투명(0.011)하게 둔다:
 * SwiftUI는 opacity 0인 뷰를 터치 대상에서 빼므로 0이 아닌 최소값을 쓴다. 칸 어디를 눌러도 입력란에 포커스가 간다.
 * 겹침 영역과 입력란은 칸 행과 같은 영역(부모 폭 × 칸 높이)을 유연 프레임으로 채운다: 창 폭으로 계산하면 폼 시트 폭과 어긋난다.
 * (SwiftUI `frame`은 width/height를 주면 max 값을 무시하므로 높이도 min/max로 고정한다.)
 */
const FILL = frame({ maxWidth: Infinity, minHeight: OTP_BOX_HEIGHT, maxHeight: OTP_BOX_HEIGHT });

export function OtpCodeField({ invalid, locked, disabled, autoFocus, accessibilityLabel, testID, onChange }: OtpCodeFieldProps) {
  const inputRef = useRef<TextInputRef>(null);
  const field = useOtpCodeField(onChange, locked, inputRef);

  return (
    <ZStack modifiers={[FILL]}>
      <OtpBoxes value={field.value} focused={field.focused} invalid={invalid} inactive={locked || disabled} />
      <TextInput
        ref={inputRef}
        testID={testID}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        maxLength={CODE_LENGTH}
        editable={!disabled}
        onChangeText={field.change}
        onSelectionChange={field.selectionChange}
        onFocus={field.onFocus}
        onBlur={field.onBlur}
        modifiers={[FILL, opacity(0.011), a11yLabel(accessibilityLabel)]}
      />
    </ZStack>
  );
}
