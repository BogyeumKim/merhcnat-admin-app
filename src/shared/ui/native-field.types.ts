import type { TextInputProps } from '@expo/ui';
import type { ReactElement } from 'react';

export type NativeFieldProps = TextInputProps & {
  /** 오류 상태. 박스 모양은 바꾸지 않는다(스펙: 입력란을 빨갛게 칠하지 않음). 오류는 아래 `FormAlert` 문장이 알린다. */
  invalid?: boolean;
  /** 필드의 접근성 이름. 보이는 라벨은 별도 요소이며, 필드에 placeholder가 없을 수도 있다. */
  accessibilityLabel?: string;
  /** 필드 끝의 컨트롤 (예: 비밀번호 표시/숨김). `@expo/ui` 요소. */
  trailing?: ReactElement;
};
