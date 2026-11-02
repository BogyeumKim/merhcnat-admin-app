import type { Capabilities } from '@/features/auth';

/**
 * The app's feature catalog, grouped into categories (the "all menu" screen shows every category). `id` is also the route param of the placeholder screen until each entry opens its WebView/native screen.
 * `requires` hides an entry unless the account has that capability.
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

/** The catalog for one account: entries it may not use are dropped, and so are categories left empty. */
export function visibleCatalog(capabilities: Capabilities): VisibleCategory[] {
  return MENU_CATALOG.map((category) => ({
    id: category.id,
    items: category.items.filter((item) => item.requires === undefined || capabilities[item.requires]),
  })).filter((category) => category.items.length > 0);
}

/** Ids of every entry the account may use (for screens that pick a few of them, such as the home grid). */
export function visibleItemIds(capabilities: Capabilities): MenuItemId[] {
  return visibleCatalog(capabilities).flatMap((category) => category.items.map((item) => item.id));
}
