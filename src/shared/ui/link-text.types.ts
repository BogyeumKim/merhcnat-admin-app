export type LinkTextProps = {
  children: string;
  onPress: () => void;
  testID?: string;
  /** `strong` is the bold dark link (a resend action); the default is the quiet gray one. */
  tone?: 'quiet' | 'strong';
};
