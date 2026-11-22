/**
 * 임시비밀번호 변경용 `challengeToken`을 메모리에만 보관한다(저장·로깅 금지, 서버 유효 5분).
 * 코드 단계 토큰(`challenge-vault`)과 분리한 이유: 인증 시트가 닫히며 코드 단계 토큰을 지울 때
 * 이 토큰까지 사라지면 안 되기 때문이다. 변경 성공, 화면 이탈, 로그아웃, 새 로그인, 시간 경과 시 폐기한다.
 */
const MAX_HOLD_MS = 5 * 60 * 1000;

type Reason = 'TEMP_PASSWORD' | 'PASSWORD_EXPIRED';

let held: string | null = null;
let heldReason: Reason = 'TEMP_PASSWORD';
/** 변경 대상 아이디(규칙 힌트용, 로그 금지). 로그인 완료 시 세션으로 넘긴다. */
let heldUserId: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function clearTempPasswordToken() {
  held = null;
  heldUserId = null;
  if (timer) clearTimeout(timer);
  timer = null;
}

/** `reason`: 임시비밀번호인지 90일 만료인지(같은 변경 흐름, 화면 문구만 다름). 없으면 임시비밀번호. */
export function holdTempPasswordToken(token: string, reason: Reason = 'TEMP_PASSWORD', userId: string | null = null) {
  clearTempPasswordToken();
  held = token;
  heldReason = reason;
  heldUserId = userId;
  timer = setTimeout(clearTempPasswordToken, MAX_HOLD_MS);
}

/** 폐기됐으면 `null`: 호출자는 로그인부터 다시 하게 해야 한다. */
export const getTempPasswordToken = () => held;
export const getTempPasswordReason = (): Reason => heldReason;
export const getTempPasswordUserId = () => heldUserId;
