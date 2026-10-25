/**
 * Login account types (`usr_type` in the legacy API). Names follow the DB columns so the team reads the same
 * vocabulary; Korean role names are comments only. This is the ONLY place the numbers appear.
 */
export const UserType = {
  /** 사업자번호로 묶은 가상 그룹 (`cono`) */
  BizGroup: 0,
  /** 가맹점 (MID) */
  Mid: 1,
  /** 딜러 (L3_VID) */
  L3Vid: 2,
  /** 대리점 (L2_VID) */
  L2Vid: 3,
  /** L1_VID (VID와 같은 값, 총판 성격) */
  L1Vid: 4,
  /** VID */
  Vid: 5,
  /** VGID (최상위) */
  Vgid: 9,
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

const USER_TYPE_VALUES: readonly number[] = Object.values(UserType);

export function isUserType(value: unknown): value is UserType {
  return typeof value === 'number' && USER_TYPE_VALUES.includes(value);
}

/**
 * Parses a login-response value once, at the boundary. Accepts numbers and numeric strings (the legacy API sent
 * both). Anything outside the allowed set is `null` — never "closest type". `0` is a valid type, so callers must
 * compare with `null`, not use truthiness.
 */
export function parseUserType(raw: unknown): UserType | null {
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  return isUserType(value) ? value : null;
}
