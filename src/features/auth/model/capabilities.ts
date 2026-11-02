import { useSession } from './session-store';
import { UserType } from './user-type';

/**
 * What a signed-in account type can see and do. Screens read these flags and never compare `userType` with a number.
 * The client is not a security boundary: the server decides the data range from the token. These flags only decide which
 * entries the UI shows. Per-merchant switches the server sends (manual pay, SMS, prepay) are merged in here when they
 * are wired in.
 */
export type Capabilities = {
  /** Payment entry points (manual card entry, SMS pay, prepay). Merchant-level accounts only. */
  canPay: boolean;
  /** Narrow the data by the hierarchy (L1 → L2 → L3 → MID). Merchant accounts see only their own data. */
  showHierarchyFilter: boolean;
  /** Look up preferred-business status of merchants below the account. */
  canLookUpPreferredBusiness: boolean;
  /** Store info opens a single merchant's detail, or a list of the merchants below the account. */
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

/** Signed-out fallback: shows nothing privileged. */
const NO_CAPABILITIES: Capabilities = {
  canPay: false,
  showHierarchyFilter: false,
  canLookUpPreferredBusiness: false,
  storeInfo: 'list',
};

/** `Record<UserType, …>` makes a new account type a compile error until it is mapped here. */
export const CAPABILITIES: Record<UserType, Capabilities> = {
  [UserType.BizGroup]: { ...MERCHANT, showHierarchyFilter: false, storeInfo: 'list' },
  [UserType.Mid]: MERCHANT,
  [UserType.L3Vid]: PARTNER,
  [UserType.L2Vid]: PARTNER,
  [UserType.L1Vid]: PARTNER,
  [UserType.Vid]: PARTNER,
  [UserType.Vgid]: PARTNER,
};

/** Capabilities of the signed-in account. Only meaningful inside the signed-in routes (`Stack.Protected`). */
export function useCapabilities(): Capabilities {
  const { userType } = useSession();
  return userType === null ? NO_CAPABILITIES : CAPABILITIES[userType];
}
