import { AccessibilityInfo } from 'react-native';
import { toast } from 'sonner-native';

type ToastInput = {
  /**
   * Stable id. Showing the same id again UPDATES the visible toast (and wiggles it) instead of stacking a copy, so
   * pressing a failing button ten times shows one error toast, not ten. Different ids stack.
   */
  id: string;
  /** Already translated. */
  title: string;
  description?: string;
};

const ERROR_DURATION_MS = 6000;

/** Transient system-level errors (network, timeout, rate limit). Input mistakes belong inline, not here. */
export function showErrorToast({ id, title, description }: ToastInput) {
  AccessibilityInfo.announceForAccessibility(description ? `${title}. ${description}` : title);
  toast.error(title, { id, description, duration: ERROR_DURATION_MS });
}

/** Low-stakes confirmation ("code sent"). */
export function showSuccessToast({ id, title, description }: ToastInput) {
  AccessibilityInfo.announceForAccessibility(description ? `${title}. ${description}` : title);
  toast.success(title, { id, description });
}
