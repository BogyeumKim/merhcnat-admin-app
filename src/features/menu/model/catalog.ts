import type { Capabilities } from '@/features/auth';

/**
 * 앱의 기능 카탈로그를 카테고리별로 묶은 것("전체 메뉴" 화면이 모든 카테고리를 보여줌). 각 항목이 WebView/네이티브 화면을 열기 전까지 `id`는 임시 화면의 라우트 파라미터이기도 하다.
 * `requires`는 계정에 해당 권한이 없으면 항목을 숨긴다.
 */
export type MenuItemId =
  | 'manualPay'
  | 'smsPay'
  | 'prepay'
  | 'transactions'
  | 'failedTransactions'
  | 'stores'
  | 'deposits'
  | 'vatReport'
  | 'preferredBusiness'
  | 'notices'
  | 'faq'
  | 'benefits'
  | 'settings';

export type MenuCategoryId = 'payment' | 'lookup' | 'settlement' | 'support' | 'account';

export type MenuItemSpec = {
  id: MenuItemId;
  requires?: keyof Pick<Capabilities, 'canPay' | 'canLookUpPreferredBusiness'>;
};

export type MenuCategorySpec = { id: MenuCategoryId; items: readonly MenuItemSpec[] };

export const MENU_CATALOG: readonly MenuCategorySpec[] = [
  {
    id: 'payment',
    items: [
      { id: 'manualPay', requires: 'canPay' },
      { id: 'smsPay', requires: 'canPay' },
      { id: 'prepay', requires: 'canPay' },
    ],
  },
  {
    id: 'lookup',
    items: [
      { id: 'transactions' },
      { id: 'failedTransactions' },
      { id: 'stores' },
      { id: 'preferredBusiness', requires: 'canLookUpPreferredBusiness' },
    ],
  },
  { id: 'settlement', items: [{ id: 'deposits' }, { id: 'vatReport' }] },
  { id: 'support', items: [{ id: 'notices' }, { id: 'benefits' }, { id: 'faq' }] },
  { id: 'account', items: [{ id: 'settings' }] },
];

export type VisibleCategory = { id: MenuCategoryId; items: MenuItemSpec[] };

/** 한 계정용 카탈로그: 사용할 수 없는 항목과, 비게 된 카테고리는 제외한다. */
export function visibleCatalog(capabilities: Capabilities): VisibleCategory[] {
  return MENU_CATALOG.map((category) => ({
    id: category.id,
    items: category.items.filter((item) => item.requires === undefined || capabilities[item.requires]),
  })).filter((category) => category.items.length > 0);
}

/** 계정이 사용할 수 있는 모든 항목의 id(홈 그리드처럼 일부만 골라 쓰는 화면용). */
export function visibleItemIds(capabilities: Capabilities): MenuItemId[] {
  return visibleCatalog(capabilities).flatMap((category) => category.items.map((item) => item.id));
}
