import type { SFSymbol } from 'expo-symbols';

/**
 * Single source of truth for the bottom tabs. `name` must match the route file in `src/app/(tabs)/`.
 * `labelKey` is an i18n key. iOS uses `sf` (SF Symbols), Android uses `md` (Material Symbols names).
 */
export const TAB_ITEMS = [
  { name: 'index', labelKey: 'tabs.home', sf: { default: 'house', selected: 'house.fill' }, md: 'home' },
  { name: 'transactions', labelKey: 'tabs.transactions', sf: { default: 'doc.text', selected: 'doc.text.fill' }, md: 'receipt_long' },
  { name: 'stores', labelKey: 'tabs.stores', sf: { default: 'storefront', selected: 'storefront.fill' }, md: 'storefront' },
  { name: 'menu', labelKey: 'tabs.menu', sf: { default: 'line.3.horizontal', selected: 'line.3.horizontal' }, md: 'menu' },
] as const satisfies readonly {
  name: string;
  labelKey: `tabs.${string}`;
  sf: { default: SFSymbol; selected: SFSymbol };
  md: string;
}[];

export type TabName = (typeof TAB_ITEMS)[number]['name'];
