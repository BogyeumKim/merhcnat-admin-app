export type NativeButtonProps = {
  label: string;
  onPress: () => void;
  /** `tonal` is the soft gray pill ("닫기" under a primary button). */
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  disabled?: boolean;
  testID?: string;
  /** Content-sized instead of full width (for example a text button next to a field). */
  compact?: boolean;
};
