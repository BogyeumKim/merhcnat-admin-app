export type NativeButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  disabled?: boolean;
  testID?: string;
  /** Content-sized instead of full width (for example a text button next to a field). */
  compact?: boolean;
};
