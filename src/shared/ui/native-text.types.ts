export type NativeTextVariant = 'largeTitle' | 'title' | 'headline' | 'label' | 'fieldLabel' | 'body' | 'subhead' | 'caption';
export type NativeTextTone = 'default' | 'secondary' | 'danger' | 'onAction' | 'action' | 'success';

export type NativeTextProps = {
  children: string;
  variant?: NativeTextVariant;
  tone?: NativeTextTone;
  center?: boolean;
  /** 길게 눌러 복사할 수 있다(사업자번호, 거래번호 등). iOS `textSelection(true)`. Android는 설치된 @expo/ui(58.0.29)에 `SelectionContainer`가 없어 아직 무시된다. */
  selectable?: boolean;
  /** 숫자 폭을 고정해 금액/시각이 바뀌어도 열이 흔들리지 않는다. iOS `monospacedDigit()`. Android 기본 글꼴(Roboto)은 숫자가 이미 고정 폭이라 무시한다(`fontFeatureSettings` 미노출). */
  tabular?: boolean;
};
