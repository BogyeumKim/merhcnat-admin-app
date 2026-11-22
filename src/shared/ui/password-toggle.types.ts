export type PasswordToggleProps = {
  /** 비밀번호가 보이는 동안 true (이때 아이콘은 숨기기를 제안한다). */
  revealed: boolean;
  /** 동작의 번역된 접근성 이름 ("표시" / "숨김"). */
  label: string;
  onPress: () => void;
};
