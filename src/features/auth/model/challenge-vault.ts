/**
 * 서버의 `challengeToken`을 비밀번호 단계부터 일회용 코드 단계 종료까지 메모리에만 보관한다.
 * 코드 호출(`otp/send`, `otp/verify`)은 비밀번호 대신 이 토큰을 보낸다: 수명이 짧고(5분), 용도가 하나이며,
 * 사용자와 기기에 묶여 있고, 서버가 시도 횟수를 센다. 비밀번호 자체는 보관하지 않으며
 * 로그인 mutation의 variables에만 존재한다(`gcTime: 0`, 호출 후 reset).
 * 안전장치: 저장·로깅 금지, React state나 쿼리 캐시에 두지 않음(mutation이 호출 시점에 여기서 읽음);
 * 성공, 취소, 로그아웃, 새 로그인, `MAX_HOLD_MS` 경과 시 폐기. 일반 모듈 변수이며
 * 렌더링에 쓰이지 않는다.
 */
const MAX_HOLD_MS = 5 * 60 * 1000;

let held: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function clearChallengeToken() {
  held = null;
  if (timer) clearTimeout(timer);
  timer = null;
}

export function holdChallengeToken(token: string) {
  clearChallengeToken();
  held = token;
  timer = setTimeout(clearChallengeToken, MAX_HOLD_MS);
}

/** 폐기(만료, 취소, 로그아웃)되었으면 `null`: 호출자는 사용자를 로그인 화면으로 돌려보내야 한다. */
export function getChallengeToken(): string | null {
  return held;
}
