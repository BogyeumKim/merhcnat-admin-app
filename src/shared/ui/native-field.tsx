import { NativeFieldBase } from './native-field-base';
import type { NativeFieldProps } from './native-field.types';

/** 박스형 텍스트 필드, 플랫폼 공용 대체 구현 (iOS/Android는 각자 파일이 있다). */
export function NativeField({ accessibilityLabel: _label, ...props }: NativeFieldProps) {
  return <NativeFieldBase {...props} />;
}
