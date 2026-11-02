export type PasswordToggleProps = {
  /** True while the password is visible (the icon then offers to hide it). */
  revealed: boolean;
  /** Translated accessible name of the action ("Show" / "Hide"). */
  label: string;
  onPress: () => void;
};
