export type NativeButtonProps = {
  label: string;
  onPress: () => void;
  /** `tonal`은 옅은 회색 pill(주 버튼 아래 "닫기"), `ink`는 상태 화면의 어두운 pill("앱 종료하기"). */
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'ink';
  disabled?: boolean;
  testID?: string;
};
