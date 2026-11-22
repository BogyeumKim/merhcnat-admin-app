/**
 * 로그인 계정 유형(레거시 API의 `usr_type`). 이름은 DB 컬럼을 따라 팀이 같은 용어로 읽도록 했고,
 * 한글 역할명은 주석으로만 둔다. 숫자가 등장하는 곳은 여기뿐이다.
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
  /** 총판 (VID) */
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
 * 로그인 응답 값을 경계에서 한 번만 파싱한다. 숫자와 숫자 문자열을 받는다(레거시 API가
 * 둘 다 보냈음). 허용 집합 밖의 값은 `null`이며 "가장 가까운 유형"으로 보정하지 않는다. `0`도 유효한 유형이므로
 * 호출자는 truthiness가 아니라 `null`과 비교해야 한다.
 */
export function parseUserType(raw: unknown): UserType | null {
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  return isUserType(value) ? value : null;
}
