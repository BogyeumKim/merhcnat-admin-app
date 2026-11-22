import { useSession } from './session-store';
import { UserType } from './user-type';

/**
 * 로그인한 계정 유형이 볼 수 있고 할 수 있는 것. 화면은 이 플래그만 읽고 `userType`을 숫자와 직접 비교하지 않는다.
 * 클라이언트는 보안 경계가 아니다: 데이터 범위는 서버가 토큰으로 결정하며, 이 플래그는 UI가 보여줄
 * 진입점만 정한다. 서버가 보내는 가맹점별 스위치(수기결제, SMS, 선결제)는 연동 시 여기에 합쳐진다.
 */
export type Capabilities = {
  /** 결제 진입점(수기 카드 입력, SMS 결제, 선결제). 가맹점 계정 전용. */
  canPay: boolean;
  /** 계층(L1 → L2 → L3 → MID)으로 데이터를 좁힌다. 가맹점 계정은 자기 데이터만 본다. */
  showHierarchyFilter: boolean;
  /** 계정 하위 가맹점의 우대 사업자 상태를 조회한다. */
  canLookUpPreferredBusiness: boolean;
  /** 가맹점 정보는 단일 가맹점 상세 또는 계정 하위 가맹점 목록을 연다. */
  storeInfo: 'detail' | 'list';
};

const MERCHANT: Capabilities = {
  canPay: true,
  showHierarchyFilter: false,
  canLookUpPreferredBusiness: false,
  storeInfo: 'detail',
};

const PARTNER: Capabilities = {
  canPay: false,
  showHierarchyFilter: true,
  canLookUpPreferredBusiness: true,
  storeInfo: 'list',
};

/** 로그아웃 상태 기본값: 권한이 필요한 것은 아무것도 보여주지 않는다. */
const NO_CAPABILITIES: Capabilities = {
  canPay: false,
  showHierarchyFilter: false,
  canLookUpPreferredBusiness: false,
  storeInfo: 'list',
};

/** `Record<UserType, …>` 덕분에 새 계정 유형을 여기에 매핑하기 전까지는 컴파일 오류가 난다. */
const CAPABILITIES: Record<UserType, Capabilities> = {
  [UserType.BizGroup]: { ...MERCHANT, showHierarchyFilter: false, storeInfo: 'list' },
  [UserType.Mid]: MERCHANT,
  [UserType.L3Vid]: PARTNER,
  [UserType.L2Vid]: PARTNER,
  [UserType.L1Vid]: PARTNER,
  [UserType.Vid]: PARTNER,
  [UserType.Vgid]: PARTNER,
};

/** 로그인한 계정의 capabilities. 로그인 라우트(`Stack.Protected`) 안에서만 의미가 있다. */
export function useCapabilities(): Capabilities {
  const { userType } = useSession();
  return userType === null ? NO_CAPABILITIES : CAPABILITIES[userType];
}
