import type { ErrorCode } from './errors';

/**
 * How a failure is shown to the user (2026 UX guidance from the research in docs/architecture/feedback-ux.md):
 * - `inline`: the user must read and act on it (wrong credentials, wrong code, blocked account). Persistent,
 *   next to the thing that failed. A toast alone would vanish before it is read.
 * - `toast`: transient, system-level problems that are not about the user's input and can simply be retried (network, timeout, unknown).
 * - `maintenance`: navigate to the maintenance screen.
 * `Record<ErrorCode, ...>` makes a new error code a compile error until it is classified.
 */
export type ErrorPresentation = 'inline' | 'toast' | 'maintenance';

const presentation: Record<ErrorCode, ErrorPresentation> = {
  UNKNOWN: 'toast',
  INVALID_CREDENTIALS: 'inline',
  ACCOUNT_TYPE_NOT_ALLOWED: 'inline',
  MAINTENANCE: 'maintenance',
  OTP_INVALID: 'inline',
  OTP_EXPIRED: 'inline',
  OTP_LOCKED: 'inline',
  TOO_MANY_REQUESTS: 'inline', // the user has to wait before retrying: a 6-second toast would be gone before they know for how long
  TOKEN_EXPIRED: 'inline',
  NETWORK_ERROR: 'toast',
  TIMEOUT: 'toast',
  INVALID_RESPONSE: 'toast',
};

export const presentationOf = (code: ErrorCode): ErrorPresentation => presentation[code];
