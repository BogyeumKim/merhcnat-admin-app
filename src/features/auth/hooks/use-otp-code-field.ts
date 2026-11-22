import { useState } from 'react';

import { CODE_LENGTH } from '../model/forms';

/**
 * 칸 사이 간격과 칸 높이(디자인: 둥근 회색 칸 6개, 칸 높이 56). 칸 폭은 계산하지 않는다:
 * 6칸이 부모(콘텐츠 컬럼) 폭을 똑같이 나눠 채운다(`OtpBoxes`). 창 폭으로 계산하면 창보다 좁은 폼 시트에서 어긋난다.
 */
export const OTP_BOX_GAP = 8;
export const OTP_BOX_HEIGHT = 56;

/**
 * 6칸 인증번호 입력의 상태. 실제 입력은 칸 위에 투명하게 겹친 하나의 네이티브 입력란이 받는다:
 * SMS 자동 완성·붙여넣기가 6자리를 한 번에 채우고, 지우기/커서 이동이 OS 기본 동작 그대로다(칸마다 입력란을 두면 이게 깨진다).
 * 칸에 숫자를 그려야 하므로 입력값(최대 6자리)을 상태로 둔다.
 */
export function useOtpCodeField(onChange: (code: string) => void) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const change = (text: string) => {
    // 붙여넣기/자동 완성에 공백·하이픈이 섞여 올 수 있다: 숫자만 남긴다.
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    // 숫자가 그대로면(가득 찬 뒤 더 누른 7번째 숫자, 숫자 아닌 문자) 알리지 않는다: 같은 코드가 자동 제출로 다시 나가 시도 횟수를 쓰지 않게.
    if (digits === value) return;
    setValue(digits);
    onChange(digits);
  };

  return {
    value,
    focused,
    change,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
}
