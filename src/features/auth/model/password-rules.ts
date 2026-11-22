export type RuleState = 'ok' | 'wait' | 'fail';

export type PasswordRules = {
  length: RuleState;
  charset: RuleState;
  /** 허용 문자 밖의 글자(공백, 한글, 이모지, 전각 등)가 있음: 문자 규칙 줄이 이유를 보여준다. */
  invalidChars: boolean;
  /** 아이디를 모르고 서버도 위반을 알리지 않았으면 `null`: 판단할 수 없는 줄은 숨긴다. */
  userId: RuleState | null;
  reuse: RuleState;
};

/**
 * 서버 정책과 같은 문자 집합: 영문 A-Z/a-z, 숫자 0-9, 공백을 뺀 출력 가능한 ASCII 기호(0x21-0x7E).
 * 그 밖의 글자가 하나라도 있으면 서버가 `CHARSET` 위반으로 거부한다.
 */
const onlyAllowedChars = (value: string) => /^[\x21-\x7E]*$/.test(value);
const hasLetter = (value: string) => /[A-Za-z]/.test(value);
const hasDigit = (value: string) => /[0-9]/.test(value);
const hasSpecial = (value: string) => /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/.test(value);
const charsetOk = (value: string) => onlyAllowedChars(value) && hasLetter(value) && hasDigit(value) && hasSpecial(value);

/** 서버가 알려준 위반 항목(`PASSWORD_POLICY_VIOLATION`의 `violations`), 없으면 `[]`. */
export type ServerViolations = readonly string[];

type RuleContext = {
  violations?: ServerViolations;
  /** 서버가 최근 비밀번호 재사용이라고 응답함. */
  reused?: boolean;
  /** 로그인(또는 변경 대상) 아이디. 메모리에서만 받으며, 모르면 `null`. */
  userId?: string | null;
};

/**
 * 아이디 줄: 서버 위반만 `fail`, 아이디를 모르면 숨김(`null`). 입력 중 아이디가 들어 있으면 빨강 대신 회색(`wait`)으로 둔다
 * (디자인 1-9: 입력 중에는 혼내지 않는다). 대소문자 구분 없이 아이디 전체가 들어 있는지 본다(힌트).
 */
function userIdRule(value: string, userId: string | null, serverViolation: boolean): RuleState | null {
  if (serverViolation) return 'fail';
  const id = userId?.trim().toLowerCase() ?? '';
  if (id === '') return null;
  if (value.length === 0) return 'wait';
  return value.toLowerCase().includes(id) ? 'wait' : 'ok';
}

/**
 * 디자인의 규칙 목록으로, 입력 중 힌트로 쓴다. 처음엔 모두 회색(`wait`), 만족한 줄만 초록(`ok`)으로 바뀌고
 * **입력 중에는 빨강(`fail`)이 되지 않는다**(디자인 1-9). `fail`은 서버가 거부했을 때만(`violations`, `reused`)이며,
 * 사용자가 새 비밀번호를 고치기 시작하면 화면 훅이 서버 판정을 지워 다시 회색/초록으로 돌아간다.
 * "최근 비밀번호 금지"는 서버만 알 수 있어 서버가 그렇다고 할 때까지 회색이다. 최종 판단은 항상 서버다.
 */
export function evaluatePasswordRules(value: string, { violations = [], reused = false, userId = null }: RuleContext = {}): PasswordRules {
  const lengthOk = value.length >= 8 && value.length <= 20;
  return {
    length: violations.includes('LENGTH') ? 'fail' : lengthOk ? 'ok' : 'wait',
    charset: violations.includes('CHARSET') ? 'fail' : charsetOk(value) ? 'ok' : 'wait',
    invalidChars: !onlyAllowedChars(value),
    userId: userIdRule(value, userId, violations.includes('CONTAINS_USER_ID')),
    reuse: reused ? 'fail' : 'wait',
  };
}

/** 클라이언트 측 검사 통과 여부(최종 판단은 서버). */
export const passwordLooksValid = (value: string) => value.length >= 8 && value.length <= 20 && charsetOk(value);

/** 버튼 활성 조건: 앱이 판단할 수 있는 규칙(길이, 문자, 아는 경우 아이디)을 모두 만족. 재사용은 서버만 판단하므로 제외. */
export const rulesSatisfied = (rules: PasswordRules) =>
  rules.length === 'ok' && rules.charset === 'ok' && (rules.userId === null || rules.userId === 'ok');
