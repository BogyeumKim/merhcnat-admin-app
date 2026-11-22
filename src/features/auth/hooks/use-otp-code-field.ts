import type { TextInputRef } from '@expo/ui';
import { type RefObject, useRef, useState } from 'react';

import { CODE_LENGTH } from '../model/forms';

/**
 * 칸 사이 간격과 칸 높이(디자인: 둥근 회색 칸 6개, 칸 높이 56). 칸 폭은 계산하지 않는다:
 * 6칸이 부모(콘텐츠 컬럼) 폭을 똑같이 나눠 채운다(`OtpBoxes`). 창 폭으로 계산하면 창보다 좁은 폼 시트에서 어긋난다.
 */
export const OTP_BOX_GAP = 8;
export const OTP_BOX_HEIGHT = 56;

/**
 * 6칸 인증번호 입력의 상태. 실제 입력은 칸 위에 투명하게 겹친 하나의 네이티브 입력란이 받는다:
 * SMS 자동 완성·붙여넣기가 6자리를 한 번에 채우고, 지우기가 OS 기본 동작 그대로다(칸마다 입력란을 두면 이게 깨진다).
 * 칸에 숫자를 그려야 하므로 입력값(최대 6자리)을 상태로 둔다.
 *
 * `inputRef`는 화면이 만들어 입력란에 건다(커서 위치 되돌리기용).
 * `locked`(확인 중): 입력란은 포커스를 유지한 채(키보드가 내려갔다 올라오지 않게) 바뀐 값을 무시한다.
 * 확인이 끝나면 화면이 `key`로 다시 마운트해 비우므로 네이티브 값과 어긋난 채 남지 않는다.
 */
export function useOtpCodeField(onChange: (code: string) => void, locked: boolean, inputRef: RefObject<TextInputRef | null>) {
  // 네이티브 입력란의 원문 길이(붙여넣은 하이픈 등 포함): 커서를 항상 맨 끝에 두는 기준.
  const rawLength = useRef(0);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const change = (text: string) => {
    rawLength.current = text.length;
    if (locked) return;
    // 붙여넣기/자동 완성에 공백·하이픈이 섞여 올 수 있다: 숫자만 남긴다.
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    // 숫자가 그대로면(가득 찬 뒤 더 누른 7번째 숫자, 숫자 아닌 문자) 알리지 않는다: 같은 코드가 자동 제출로 다시 나가 시도 횟수를 쓰지 않게.
    if (digits === value) return;
    setValue(digits);
    onChange(digits);
  };

  // 중간 칸을 눌러도 커서는 마지막 입력 위치로 간다(디자인: 중간 칸만 고치는 동작은 없다). 겹친 입력란의 탭이 커서를 옮기면 되돌린다.
  const selectionChange = ({ start, end }: { start: number; end: number }) => {
    const last = rawLength.current;
    if (start !== last || end !== last) void inputRef.current?.setSelection(last, last);
  };

  return {
    value,
    focused,
    change,
    selectionChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
}
