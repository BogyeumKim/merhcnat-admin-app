import type { Capabilities } from '@/features/auth';

/**
 * The app's feature catalog, grouped into categories (the "all menu" screen shows every category; the home screen picks
 * the shortcuts). `id` is also the route param of the placeholder screen until each entry opens its WebView/native screen.
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
  | 'faq';

export type MenuCategoryId = 'payment' | 'lookup' | 'settlement' | 'support';

export type MenuItemSpec = {
  id: MenuItemId;
  requires?: keyof Pick<Capabilities, 'canPay' | 'canLookUpPreferredBusiness'>;
  /** Shown as a shortcut on the home screen. */
  shortcut?: boolean;
};

export type MenuCategorySpec = { id: MenuCategoryId; items: readonly MenuItemSpec[] };

export const MENU_CATALOG: readonly MenuCategorySpec[] = [
  {
    id: 'payment',
    items: [
      { id: 'manualPay', requires: 'canPay', shortcut: true },
      { id: 'smsPay', requires: 'canPay', shortcut: true },
      { id: 'prepay', requires: 'canPay' },
    ],
  },
  {
    id: 'lookup',
    items: [
      { id: 'transactions', shortcut: true },
      { id: 'failedTransactions' },
      { id: 'stores', shortcut: true },
      { id: 'preferredBusiness', requires: 'canLookUpPreferredBusiness' },
    ],
  },
  { id: 'settlement', items: [{ id: 'deposits', shortcut: true }, { id: 'vatReport' }] },
  { id: 'support', items: [{ id: 'notices' }, { id: 'faq' }] },
];

export type VisibleCategory = { id: MenuCategoryId; items: MenuItemSpec[] };

/** The catalog for one account: entries it may not use are dropped, and so are categories left empty. */
export function visibleCatalog(capabilities: Capabilities): VisibleCategory[] {
  return MENU_CATALOG.map((category) => ({
    id: category.id,
    items: category.items.filter((item) => item.requires === undefined || capabilities[item.requires]),
  })).filter((category) => category.items.length > 0);
}

/** Entries the account may use that are worth a shortcut on the home screen, in catalog order. */
export function shortcutItems(capabilities: Capabilities): MenuItemId[] {
  return visibleCatalog(capabilities).flatMap((category) =>
    category.items.filter((item) => item.shortcut).map((item) => item.id),
  );
}
