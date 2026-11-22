/** 앱이 번역할 수 있는 안정적인 머신 코드(로케일 파일의 `errors.<code>`). */
export const ERROR_CODES = [
  'UNKNOWN',
  'INVALID_CREDENTIALS',
  'UNSUPPORTED_LOGIN_TYPE',
  /** 관리자가 해제할 때까지 잠김(비밀번호 또는 코드 누적 5회 오류). 재시도 금지. */
  'ACCOUNT_LOCKED',
  /** 관리자가 정지한 계정. 비밀번호가 맞은 뒤에만 내려오며 실패 횟수에 합산되지 않는다. */
  'ACCOUNT_SUSPENDED',
  'MAINTENANCE',
  /** 설치된 앱이 서버 허용 버전보다 낮음(레거시 `8888`): 스토어 업데이트만 가능하다. */
  'UPDATE_REQUIRED',
  /** 서버가 이 기기를 거부함(루팅, 탈옥 또는 변조): 이 기기에서는 앱을 쓸 수 없다. */
  'DEVICE_INSECURE',
  'OTP_INVALID',
  'OTP_EXPIRED',
  /** 이전 서버 호환용: 현재 서버는 같은 수단 재발송 대기를 없애 더는 보내지 않는다(받으면 인라인 안내). */
  'OTP_RESEND_TOO_SOON',
  /** 발송 한도 초과: challenge당 모든 수단 합쳐 5회(data 없음). 인증 시트를 닫고 처음부터 다시 로그인한다. */
  'OTP_SEND_LIMIT_EXCEEDED',
  'OTP_CHANNEL_INVALID',
  'PHONE_NOT_REGISTERED',
  'TOTP_NOT_ENROLLED',
  /** challenge 토큰이 없음(만료되었거나 소진): 처음부터 다시 로그인한다. */
  'CHALLENGE_EXPIRED',
  /** 로그인이 보낸 기기 정보가 없거나 형식이 잘못됨(앱 버그이며 사용자가 고칠 수 없음). */
  'DEVICE_REQUIRED',
  'DEVICE_INVALID',
  'PUSH_TOKEN_INVALID',
  'DEVICE_NOT_FOUND',
  /** 푸시 갱신: 기기 비밀키가 맞지 않음(재설치 등). 다음 OTP 로그인 후 새 비밀키로 해결된다. */
  'DEVICE_NOT_VERIFIED',
  /** 비밀번호 변경: 현재 비밀번호가 틀림(5회 잠금에 포함), 새 비밀번호가 규칙을 어김, 또는 최근에 쓴 비밀번호. */
  'CURRENT_PASSWORD_INVALID',
  'PASSWORD_POLICY_VIOLATION',
  'PASSWORD_REUSED',
  'TOO_MANY_REQUESTS',
  'TOKEN_EXPIRED',
  /** 같은 계정의 다른 로그인(다른 기기 또는 새 로그인)이 이 토큰을 무효화함(401). 로그아웃하고 이유를 안내한다. */
  'SESSION_REPLACED',
  /** 15분간 API 호출이 없었거나 서버 세션이 삭제됨(예: 비밀번호 변경)(401). */
  'SESSION_EXPIRED',
  /** 서버 세션 저장소 장애(503). 세션은 유효할 수 있으므로 로그아웃하지 않고 재시도만 안내한다(점검 아님). */
  'SESSION_STORE_UNAVAILABLE',
  'NETWORK_ERROR',
  'TIMEOUT',
  'INVALID_RESPONSE',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const isErrorCode = (value: unknown): value is ErrorCode => ERROR_CODES.some((code) => code === value);

/** 우리 코드 중 하나와 의미가 같은 서버 코드(유효한 토큰 없는 401은 만료된 세션). */
const SERVER_CODE_ALIASES: Record<string, ErrorCode> = {
  UNAUTHORIZED: 'TOKEN_EXPIRED',
  BAD_REQUEST: 'UNKNOWN',
  INTERNAL_ERROR: 'UNKNOWN',
};

/** 서버의 알 수 없는 코드는 원문 문자열이 UI에 노출되지 않도록 `UNKNOWN`으로 낮춘다. */
export function toErrorCode(value: unknown): ErrorCode {
  if (isErrorCode(value)) return value;
  return (typeof value === 'string' ? SERVER_CODE_ALIASES[value] : undefined) ?? 'UNKNOWN';
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  /** 서버 envelope의 `data`와 부가 정보(예: 점검 `startedAt`/`endsAt`, 업데이트 `minAppVersion`, `retryAfterSeconds`). */
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

/** `ApiError`가 아닌 모든 throw는 `UNKNOWN`이 되므로 UI 코드는 오류 타입 하나만 다룬다. */
export const asApiError = (error: unknown): ApiError =>
  isApiError(error) ? error : new ApiError({ status: 0, code: 'UNKNOWN' });
