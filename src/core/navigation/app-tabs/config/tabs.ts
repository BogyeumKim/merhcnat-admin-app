import type { SFSymbol } from 'expo-symbols';

/**
 * Single source of truth for the bottom tabs. `name` must match the route file in `src/app/(tabs)/`.
 * `labelKey` is an i18n key. iOS uses `sf`; Android icons live next to the Compose bar (XML vector drawables).
 */
export const TAB_ITEMS = [
  { name: 'index', labelKey: 'tabs.home', sf: { default: 'house', selected: 'house.fill' } },
  { name: 'menu', labelKey: 'tabs.menu', sf: { default: 'line.3.horizontal', selected: 'line.3.horizontal' } },
] as const satisfies readonly {
  name: string;
  labelKey: `tabs.${string}`;
  sf: { default: SFSymbol; selected: SFSymbol };
}[];

export type TabName = (typeof TAB_ITEMS)[number]['name'];
