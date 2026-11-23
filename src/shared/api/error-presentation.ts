import type { ErrorCode } from './errors';

/**
 * 실패를 사용자에게 보여주는 방식(docs/architecture/feedback-ux.md 조사에 기반한 2026 UX 지침):
 * - `inline`: 사용자가 읽고 조치해야 하는 것(잘못된 자격 증명, 잘못된 코드, 차단된 계정). 실패한 대상 옆에
 *   지속적으로 표시한다. 토스트만 쓰면 읽기 전에 사라진다.
 * - `toast`: 사용자 입력과 무관한 일시적인 시스템 문제로 단순 재시도하면 되는 것(네트워크, 타임아웃, 알 수 없음).
 * - `suspended`: 정지된 사용자 안내로 이동(고객센터 문의, 재시도 없음).
 * - `maintenance`: 점검 화면으로 이동.
 * - `locked`: 계정 잠김 안내로 이동(관리자에게 문의, 재시도 없음).
 * - `update`: 필수 업데이트 화면으로 이동(스토어만 가능).
 * - `insecure`: 안전하지 않은 기기 화면으로 이동(이 기기에서는 앱을 쓸 수 없음).
 * `Record<ErrorCode, ...>` 덕분에 새 오류 코드는 분류하기 전까지 컴파일 오류가 난다.
 */
export type ErrorPresentation = 'inline' | 'toast' | 'maintenance' | 'locked' | 'suspended' | 'update' | 'insecure';

const presentation: Record<ErrorCode, ErrorPresentation> = {
  UNKNOWN: 'toast',
  INVALID_CREDENTIALS: 'inline',
  UNSUPPORTED_LOGIN_TYPE: 'inline',
  LOGIN_NOT_ALLOWED: 'inline',
  ACCOUNT_LOCKED: 'locked',
  ACCOUNT_SUSPENDED: 'suspended',
  MAINTENANCE: 'maintenance',
  UPDATE_REQUIRED: 'update',
  DEVICE_INSECURE: 'insecure',
  OTP_INVALID: 'inline',
  OTP_EXPIRED: 'inline',
  OTP_RESEND_TOO_SOON: 'inline', // 이전 서버 전용: 현재 서버는 같은 수단 재발송 대기가 없어 보내지 않는다
  OTP_SEND_LIMIT_EXCEEDED: 'inline', // 인증 흐름이 직접 처리(토스트 + 시트 닫기, 처음부터 로그인)
  OTP_CHANNEL_INVALID: 'inline',
  PHONE_NOT_REGISTERED: 'inline', // 이전 서버 전용: 지금은 빈 `channels`로 와서 인증 시트가 안내한다
  TOTP_NOT_ENROLLED: 'inline',
  CHALLENGE_EXPIRED: 'toast', // 흐름이 로그인부터 다시 시작되며, 토스트가 이유를 설명한다
  DEVICE_REQUIRED: 'toast',
  DEVICE_INVALID: 'toast',
  PUSH_TOKEN_INVALID: 'toast',
  DEVICE_NOT_FOUND: 'toast',
  DEVICE_NOT_VERIFIED: 'toast',
  CURRENT_PASSWORD_INVALID: 'inline',
  PASSWORD_POLICY_VIOLATION: 'inline',
  PASSWORD_REUSED: 'inline',
  TOO_MANY_REQUESTS: 'inline', // 사용자가 기다린 뒤 재시도해야 한다: 6초 토스트는 얼마나 기다릴지 알기도 전에 사라진다
  TOKEN_EXPIRED: 'inline',
  SESSION_REPLACED: 'inline', // 세션 종료 401: 로그인 화면의 로그아웃 안내가 이유를 보여준다
  SESSION_EXPIRED: 'inline',
  SESSION_STORE_UNAVAILABLE: 'toast', // 일시적: 토큰을 유지한 채 잠시 후 재시도
  FORBIDDEN: 'toast', // 권한 없음(403): 세션은 유지하고 일반 오류로 알린다
  NETWORK_ERROR: 'toast',
  TIMEOUT: 'toast',
  INVALID_RESPONSE: 'toast',
};

export const presentationOf = (code: ErrorCode): ErrorPresentation => presentation[code];
