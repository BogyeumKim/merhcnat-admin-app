/** Stable machine codes the app can translate (`errors.<code>` in the locale files). */
export const ERROR_CODES = [
  'UNKNOWN',
  'INVALID_CREDENTIALS',
  'UNSUPPORTED_LOGIN_TYPE',
  /** Locked until an administrator unlocks it (5 wrong passwords or codes in total). Never retry. */
  'ACCOUNT_LOCKED',
  'MAINTENANCE',
  'OTP_INVALID',
  'OTP_EXPIRED',
  'OTP_RESEND_TOO_SOON',
  'OTP_CHANNEL_INVALID',
  'PHONE_NOT_REGISTERED',
  'TOTP_NOT_ENROLLED',
  /** The challenge token is gone (expired or used up): sign in again from the start. */
  'CHALLENGE_EXPIRED',
  /** The device information the login sent was missing or malformed (an app bug, not something the user can fix). */
  'DEVICE_REQUIRED',
  'DEVICE_INVALID',
  'PUSH_TOKEN_INVALID',
  'DEVICE_NOT_FOUND',
  /** Password change: the current password was wrong (counts toward the 5-try lock), the new one broke a rule, or it was used recently. */
  'CURRENT_PASSWORD_INVALID',
  'PASSWORD_POLICY_VIOLATION',
  'PASSWORD_REUSED',
  'TOO_MANY_REQUESTS',
  'TOKEN_EXPIRED',
  'NETWORK_ERROR',
  'TIMEOUT',
  'INVALID_RESPONSE',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const isErrorCode = (value: unknown): value is ErrorCode => ERROR_CODES.some((code) => code === value);

/** Server codes that mean the same as one of ours (a 401 without a valid token is an expired session). */
const SERVER_CODE_ALIASES: Record<string, ErrorCode> = {
  UNAUTHORIZED: 'TOKEN_EXPIRED',
  BAD_REQUEST: 'UNKNOWN',
  INTERNAL_ERROR: 'UNKNOWN',
};

/** Unknown codes from the server degrade to `UNKNOWN` instead of leaking a raw string into the UI. */
export function toErrorCode(value: unknown): ErrorCode {
  if (isErrorCode(value)) return value;
  return (typeof value === 'string' ? SERVER_CODE_ALIASES[value] : undefined) ?? 'UNKNOWN';
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  /** Extra RFC 9457 members the server sent (for example `startAt`, `endAt`, `retryAfterSeconds`). */
  readonly extras: Readonly<Record<string, unknown>>;

  constructor(init: { status: number; code: ErrorCode; message?: string; extras?: Record<string, unknown> }) {
    super(init.message ?? init.code);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.extras = init.extras ?? {};
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** Anything thrown that is not an `ApiError` becomes `UNKNOWN`, so UI code only ever deals with one error type. */
export const asApiError = (error: unknown): ApiError =>
  isApiError(error) ? error : new ApiError({ status: 0, code: 'UNKNOWN' });
