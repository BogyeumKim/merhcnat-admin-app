/** Stable machine codes the app can translate (`errors.<code>` in the locale files). */
export const ERROR_CODES = [
  'UNKNOWN',
  'INVALID_CREDENTIALS',
  'ACCOUNT_TYPE_NOT_ALLOWED',
  'MAINTENANCE',
  'OTP_INVALID',
  'OTP_EXPIRED',
  'OTP_LOCKED',
  'TOO_MANY_REQUESTS',
  'TOKEN_EXPIRED',
  'NETWORK_ERROR',
  'TIMEOUT',
  'INVALID_RESPONSE',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const isErrorCode = (value: unknown): value is ErrorCode => ERROR_CODES.some((code) => code === value);

/** Unknown codes from the server degrade to `UNKNOWN` instead of leaking a raw string into the UI. */
export function toErrorCode(value: unknown): ErrorCode {
  return isErrorCode(value) ? value : 'UNKNOWN';
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
