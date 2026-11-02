/**
 * Holds the server's `challengeToken` in MEMORY only, between the password step and the end of the one-time-code step.
 * The token is what the code calls (`otp/send`, `otp/verify`) send instead of the password: it is short-lived (5
 * minutes), single-purpose, tied to the user and the device, and the server counts the attempts. The password itself is
 * never kept: it only lives in the login mutation's variables (`gcTime: 0`, reset after the call).
 * Safeguards: never persisted, never logged, never in React state or the query cache (mutations read it here at
 * call time); dropped on success, cancel, sign-out, a new login, and after `MAX_HOLD_MS`. A plain module variable:
 * nothing renders from it.
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

/** `null` once it was dropped (expired, cancelled, signed out): the caller must send the user back to sign-in. */
export function getChallengeToken(): string | null {
  return held;
}
