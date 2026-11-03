export type RuleState = 'ok' | 'wait' | 'fail';

export type PasswordRules = { length: RuleState; charset: RuleState; userId: RuleState; reuse: RuleState };

/** The server's character classes: letters, digits and "anything else" (special characters). */
const hasLetter = (value: string) => /[A-Za-z]/.test(value);
const hasDigit = (value: string) => /\d/.test(value);
const hasSpecial = (value: string) => /[^A-Za-z0-9]/.test(value);

/** Violations the server named (`PASSWORD_POLICY_VIOLATION` `violations`), or `[]`. */
export type ServerViolations = readonly string[];

/**
 * The rule list of the design, as hints while typing. Length and character classes are checked here; "no ID inside"
 * and "not a recent password" need the server (the app does not keep the ID), so they stay `wait` until the server
 * answers and only turn `fail` if it says so.
 */
export function evaluatePasswordRules(value: string, violations: ServerViolations = [], reused = false): PasswordRules {
  const touched = value.length > 0;
  const lengthOk = value.length >= 8 && value.length <= 20;
  const charsetOk = hasLetter(value) && hasDigit(value) && hasSpecial(value);
  return {
    length: !touched ? 'wait' : lengthOk && !violations.includes('LENGTH') ? 'ok' : 'fail',
    charset: !touched ? 'wait' : charsetOk && !violations.includes('CHARSET') ? 'ok' : 'fail',
    userId: violations.includes('CONTAINS_USER_ID') ? 'fail' : 'wait',
    reuse: reused ? 'fail' : 'wait',
  };
}

/** Whether the client-side checks pass (the server still has the last word). */
export const passwordLooksValid = (value: string) =>
  value.length >= 8 && value.length <= 20 && hasLetter(value) && hasDigit(value) && hasSpecial(value);
